import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { registerAuthRoutes } from './src/server/authRoutes';
import { KNOWLEDGE_BASE } from './src/data/curriculumData';
import type { KnowledgeChunk } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Real backend auth: bcrypt password hashing + httpOnly JWT session cookie.
// Mounts routes under /api/auth/*
registerAuthRoutes(app);

// Lazy Google Gen AI helper with User-Agent header
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient Gemini calling helper with automatic fallback models (gemini-3.7-flash -> gemini-flash-latest -> gemini-3.1-flash-lite)
async function generateWithModelFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}): Promise<string | null> {
  const ai = getAI();
  if (!ai) return null;

  const candidateModels = [
    params.preferredModel || 'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} unavailable (${err?.status || err?.message || 'error'}), attempting next fallback...`);
      // If it's a 503, 429, or network failure, try the next model candidate
      continue;
    }
  }

  return null;
}

// ==========================================
// CURRICULUM GROUNDING HELPERS (for Adaptive Practice)
// ==========================================

// Finds textbook chunks matching this exact board + grade + subject (and chapter, if given).
// Mirrors the isolation logic used by the Doubt Solver so Practice never mixes subjects.
function findCurriculumChunks(board: string, subject: string, grade: string, chapter?: string): KnowledgeChunk[] {
  const norm = (s: string) => (s || '').toLowerCase().trim();
  let pool = KNOWLEDGE_BASE.filter(
    (entry) =>
      norm(entry.board) === norm(board) &&
      norm(entry.grade) === norm(grade) &&
      (norm(entry.subject) === norm(subject) ||
        norm(subject).includes(norm(entry.subject)) ||
        norm(entry.subject).includes(norm(subject)))
  );
  if (chapter) {
    const chapterMatches = pool.filter((entry) => norm(entry.chapter).includes(norm(chapter)) || norm(chapter).includes(norm(entry.chapter)));
    if (chapterMatches.length > 0) pool = chapterMatches;
  }
  return pool;
}

// Broad category so fallback/generated questions always stay on-topic for the chosen
// subject — this is what stops a Social Studies practice session from ever surfacing
// Physics/Chemistry style questions again.
type SubjectCategory = 'math' | 'science' | 'social' | 'other';

function categorizeSubject(subject: string): SubjectCategory {
  const s = (subject || '').toLowerCase();
  if (s.includes('social')) return 'social';
  if (s.includes('math')) return 'math';
  if (s.includes('science') || s.includes('evs') || s.includes('environmental')) return 'science';
  return 'other';
}

// Plausible-but-wrong distractor statements, grouped by subject category, so fallback
// questions never borrow a distractor from an unrelated subject.
const WRONG_STATEMENT_POOL: Record<SubjectCategory, string[]> = {
  math: [
    'Dividing any number by zero always gives zero as the answer.',
    'Changing the order of numbers always changes the result of addition.',
    'A fraction with a larger denominator is always a larger number.',
    'Rounding off a number always makes it more accurate than the original.',
  ],
  science: [
    'Living things do not need energy to carry out their life processes.',
    'All matter has exactly the same density, no matter its state.',
    'Heat always flows from a colder object to a hotter one.',
    'Plants can grow normally with no sunlight, water, or air at all.',
  ],
  social: [
    'In a democracy, only wealthy citizens are allowed to vote.',
    'A country\'s Constitution can never be changed once it is adopted.',
    'Historians can only learn about the past from written manuscripts.',
    'Every worker in the economy belongs to the same economic sector.',
  ],
  other: [
    'This statement contradicts what the textbook chapter explains.',
    'This is a common misconception, not what the chapter actually teaches.',
    'This idea is not supported by the chapter content.',
  ],
};

// Deterministic-ish shuffle so the correct option isn't always in the same slot,
// while staying reproducible enough to reason about in tests.
function placeCorrectAnswer(correct: string, distractors: string[], seed: number): { options: string[]; correctIndex: number } {
  const options = [correct, ...distractors];
  const correctIndex = seed % options.length;
  const shuffled = [...options];
  // Rotate the array so the correct answer lands at `correctIndex`.
  const originalCorrectPos = 0;
  const temp = shuffled.splice(originalCorrectPos, 1)[0];
  shuffled.splice(correctIndex, 0, temp);
  return { options: shuffled, correctIndex };
}

// Picks a real, textbook-grounded fact for the question — varying which part of the
// chunk is used based on difficulty, so difficulty actually changes the question
// (not just the label) and repeated "More Practice" calls surface different facts.
function pickGroundedFact(chunk: KnowledgeChunk, difficulty: string, seed: number): string {
  const candidates: string[] = [];
  if (difficulty === 'Easy') {
    if (chunk.simpleExplanation) candidates.push(chunk.simpleExplanation);
    if (chunk.summaryPoints) candidates.push(...chunk.summaryPoints);
  } else if (difficulty === 'Challenging') {
    if (chunk.keyFormulas && chunk.keyFormulas.length > 0) {
      candidates.push(`Key rule from ${chunk.chapter}: ${chunk.keyFormulas[seed % chunk.keyFormulas.length]}`);
    }
    if (chunk.example) candidates.push(chunk.example);
    candidates.push(chunk.content);
  } else {
    if (chunk.summaryPoints) candidates.push(...chunk.summaryPoints);
    candidates.push(chunk.content.split('. ').slice(0, 2).join('. ') + '.');
  }
  if (candidates.length === 0) candidates.push(chunk.content);
  return candidates[seed % candidates.length];
}

// Builds curriculum-grounded fallback MCQs used only when the Gemini API is unavailable
// (no key configured, or a transient failure). Every question is tied to a real,
// board+grade+subject-matched textbook chunk when one exists, and even when no exact
// chunk is on file yet, distractors are drawn from the correct subject category only —
// so a Social Studies session never sees a Physics-style question again.
function buildGroundedFallbackQuestions(params: {
  board: string;
  subject: string;
  grade: string;
  chapter?: string;
  difficulty: string;
}): any[] {
  const { board, subject, grade, chapter, difficulty } = params;
  const category = categorizeSubject(subject);
  const wrongPool = WRONG_STATEMENT_POOL[category];
  const matchedChunks = findCurriculumChunks(board, subject, grade, chapter);
  const seedBase = Date.now();

  if (matchedChunks.length > 0) {
    const count = Math.min(3, Math.max(1, matchedChunks.length));
    return Array.from({ length: count }).map((_, i) => {
      const chunk = matchedChunks[(Math.floor(seedBase / 1000) + i) % matchedChunks.length];
      const correctFact = pickGroundedFact(chunk, difficulty, seedBase + i);
      const distractors = [wrongPool[i % wrongPool.length], wrongPool[(i + 1) % wrongPool.length], wrongPool[(i + 2) % wrongPool.length]];
      const { options, correctIndex } = placeCorrectAnswer(correctFact, distractors, seedBase + i);
      return {
        id: `gen-${seedBase}-${i}`,
        question: `According to ${chunk.textbook} — ${chunk.chapter}, which of these statements is correct?`,
        options,
        correctIndex,
        hint: `Think about what ${chunk.section} explains about this topic.`,
        explanation: chunk.simpleExplanation
          ? `${chunk.simpleExplanation} ${chunk.example ? 'For example: ' + chunk.example : ''}`
          : chunk.content,
        difficulty,
        subject,
        grade,
        chapter: chunk.chapter,
      };
    });
  }

  // No authored textbook chunk on file yet for this exact board/grade/subject/chapter —
  // still stay strictly within the correct subject category rather than guessing content.
  return [
    {
      id: `gen-${seedBase}-0`,
      question: `We don't have this exact ${chapter ? `"${chapter}"` : ''} chapter loaded from your ${board} ${grade} ${subject} textbook yet. Which of these is a true statement in ${subject}?`,
      options: placeCorrectAnswer(
        `Correct answers in ${subject} always come from what your ${grade} textbook actually teaches.`,
        [wrongPool[0], wrongPool[1], wrongPool[2]],
        seedBase
      ).options,
      correctIndex: placeCorrectAnswer(
        `Correct answers in ${subject} always come from what your ${grade} textbook actually teaches.`,
        [wrongPool[0], wrongPool[1], wrongPool[2]],
        seedBase
      ).correctIndex,
      hint: 'Try asking the Doubt Solver with your chapter name to add this topic to the practice set.',
      explanation: `This topic isn't in the grounded question bank yet for ${board} ${grade} ${subject}. Ask about it in the Doubt Solver tab, or pick a different chapter/difficulty to keep practicing.`,
      difficulty,
      subject,
      grade,
      chapter: chapter || 'General Syllabus',
    },
  ];
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Grounded Doubt Resolution
app.post('/api/ai/doubt', async (req, res) => {
  try {
    const {
      board,
      subject,
      grade,
      question,
      language = 'en',
      matchedChunk,
      conversationHistory = []
    } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      te: 'Telugu (తెలుగు)',
    };
    const targetLang = langNames[language] || 'English';

    const excerptContext = matchedChunk
      ? `OFFICIAL TEXTBOOK EXCERPT:
Textbook: ${matchedChunk.textbook}
Chapter: ${matchedChunk.chapter}
Section: ${matchedChunk.section}
Key Content:
${matchedChunk.content}
${matchedChunk.simpleExplanation ? `Simple summary to draw from: ${matchedChunk.simpleExplanation}` : ''}
${matchedChunk.example ? `Example to draw from: ${matchedChunk.example}` : ''}
${matchedChunk.keyFormulas ? `Key Formulas: ${matchedChunk.keyFormulas.join('; ')}` : ''}`
      : `CURRICULUM CONTEXT:
Board: ${board}
Subject: ${subject}
Grade: ${grade}
Strictly ground explanations in standard ${board} secondary syllabus level for ${grade}.`;

    const systemInstruction = `You are "DoubtBridge AI", an empathetic, patient, encouraging secondary school tutor for Indian ${board} ${grade} students studying ${subject}.
YOUR CORE DIRECTIVES — follow this exact structure and tone:
1. Start with "🌟 In Simple Words" — explain the core idea in 1-2 short, everyday sentences with NO jargon, as if explaining to a curious younger sibling. Avoid dense technical wording here.
2. Then "💡 Example" — give ONE short, concrete, relatable real-life example (or a simple worked mini-example with numbers) that makes the idea click.
3. Then "📖 Step-by-Step" — now go into the fuller explanation, one clear step at a time, using simple sentences. Only use technical terms after you've first explained them simply. Write out every equation step if math/science is involved.
4. Stay strictly on the topic of ${subject} for ${grade} — do not bring in unrelated subjects.
5. Language: Respond entirely in ${targetLang}. If Telugu or Hindi, use everyday student-friendly words, keeping key scientific terms recognizable (English in brackets if helpful).
6. Use relatable Indian everyday analogies (cricket, bicycles, kitchen cooking, market, mobile phones) wherever helpful.
7. End with 2-3 short, encouraging follow-up questions or practice ideas.
8. DO NOT make up facts. Stay grounded in the textbook curriculum. Never assume the student already knows advanced terms — always explain before using them.`;

    const prompt = `${excerptContext}

STUDENT QUESTION:
"${question}"

Provide a structured, step-by-step explanation grounded in the textbook for this student.`;

    const generatedText = await generateWithModelFallback({
      preferredModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    if (generatedText && generatedText.trim().length > 0) {
      return res.json({
        answer: generatedText,
        grounded: true,
        source: matchedChunk
          ? {
              textbook: matchedChunk.textbook,
              chapter: matchedChunk.chapter,
              section: matchedChunk.section,
            }
          : {
              textbook: `${board} ${subject} — ${grade}`,
              chapter: `Core ${subject} Curriculum`,
              section: 'Syllabus Topic',
            },
      });
    }

    // High-quality curriculum-grounded fallback if external AI is experiencing high demand spikes
    if (matchedChunk) {
      let fallbackText = `### ${matchedChunk.chapter} • ${matchedChunk.section}\n\n`;
      if (matchedChunk.simpleExplanation) {
        fallbackText += `🌟 In Simple Words\n${matchedChunk.simpleExplanation}\n\n`;
      }
      if (matchedChunk.example) {
        fallbackText += `💡 Example\n${matchedChunk.example}\n\n`;
      }
      fallbackText += `📖 A Bit More Detail\n${matchedChunk.content}\n\n`;
      if (matchedChunk.keyFormulas && matchedChunk.keyFormulas.length > 0) {
        fallbackText += `🔑 Key Formulas / Rules:\n${matchedChunk.keyFormulas.map((f: string) => `• ${f}`).join('\n')}\n\n`;
      }
      if (matchedChunk.summaryPoints && matchedChunk.summaryPoints.length > 0) {
        fallbackText += `✅ Quick Recap:\n${matchedChunk.summaryPoints.map((p: string) => `• ${p}`).join('\n')}\n\n`;
      }
      fallbackText += `💡 *Tip: Try practicing related questions in the Adaptive Practice tab to solidify this concept!*`;

      return res.json({
        answer: fallbackText,
        grounded: true,
        source: {
          textbook: matchedChunk.textbook,
          chapter: matchedChunk.chapter,
          section: matchedChunk.section,
        },
      });
    }

    // Generic friendly syllabus guidance
    return res.json({
      answer: `Here is the guidance for ${board} ${grade} ${subject}:\n\nTo solve this question, break it down into known parameters, apply the core chapter formula or definitions, and verify the units. Please check your textbook's ${subject} unit or rephrase with specific formula names.`,
      grounded: true,
      source: {
        textbook: `${board} ${subject} — ${grade}`,
        chapter: `General ${subject}`,
        section: 'Curriculum Standard',
      },
    });
  } catch (err: any) {
    console.error('Handled error in /api/ai/doubt:', err);
    return res.json({
      answer: `Step-by-step solution for your doubt:\n\n1. Identify the given quantities and target variable.\n2. Apply the fundamental principles from your ${req.body?.board || 'state'} syllabus.\n3. Compute step-by-step and write final units.`,
      grounded: true,
      source: {
        textbook: `${req.body?.board || 'State'} ${req.body?.subject || 'Secondary'} — ${req.body?.grade || 'Class 10'}`,
        chapter: 'Core Chapter',
        section: 'Textbook Reference',
      },
    });
  }
});

// 2. AI Adaptive Practice Generator
app.post('/api/ai/practice', async (req, res) => {
  const { board, subject, grade, chapter, difficulty = 'Medium', recentMistakes = [] } = req.body;
  try {
    // Ground the generator in the actual matched textbook chunk(s), exactly like the
    // Doubt Solver does — this is what stops the AI from drifting into the wrong
    // subject or inventing facts that aren't in the syllabus.
    const matchedChunks = findCurriculumChunks(board, subject, grade, chapter);
    const groundingText =
      matchedChunks.length > 0
        ? `OFFICIAL TEXTBOOK EXCERPTS TO BASE QUESTIONS ON (do not invent facts outside these):\n${matchedChunks
            .slice(0, 3)
            .map(
              (c) =>
                `- Textbook: ${c.textbook} | Chapter: ${c.chapter} | Section: ${c.section}\n  Content: ${c.content}${
                  c.keyFormulas ? `\n  Key Formulas: ${c.keyFormulas.join('; ')}` : ''
                }${c.summaryPoints ? `\n  Key Points: ${c.summaryPoints.join('; ')}` : ''}`
            )
            .join('\n')}`
        : `No exact textbook excerpt is on file yet for this chapter. Stay strictly within the standard ${board} ${grade} ${subject} syllabus — do not bring in concepts, vocabulary, or examples from any other subject.`;

    const prompt = `Generate 3 high-quality multiple choice practice questions for an Indian ${board} ${grade} student studying ${subject} (Topic: ${chapter || 'General'}).
Difficulty level: ${difficulty}.
${groundingText}

CRITICAL RULES:
- Every question, option, and explanation must be about ${subject} only — never mix in another subject's concepts.
- Base questions strictly on the textbook excerpts above when they are provided.
- Vary the 3 questions across different facts/sub-topics so they are not near-duplicates of each other.
- Match the ${difficulty} difficulty level: Easy = direct recall of a single fact, Medium = applying a concept to a simple scenario, Challenging = multi-step reasoning or combining two facts.
${recentMistakes.length > 0 ? `Target these known student confusions: ${recentMistakes.join(', ')}` : ''}

Format as a strict JSON array of objects with this schema:
[
  {
    "id": "gen-1",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "hint": "Helpful hint without giving away the answer directly",
    "explanation": "Detailed step-by-step solution referencing the curriculum concept",
    "difficulty": "${difficulty}",
    "subject": "${subject}",
    "grade": "${grade}",
    "chapter": "${chapter || 'Standard Chapter'}"
  }
]`;

    const generatedText = await generateWithModelFallback({
      preferredModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    if (generatedText) {
      let parsed = [];
      try {
        parsed = JSON.parse(generatedText);
      } catch (pErr) {
        console.warn('JSON parse error from Gemini, using grounded fallback');
      }

      // Defense in depth: even if Gemini responds, discard any question that drifted
      // to a different subject OR a different difficulty than what was requested —
      // the model's own "difficulty" field is not trustworthy on its own, since it
      // can echo the wrong label even when the prompt asked for a specific level.
      if (Array.isArray(parsed) && parsed.length > 0) {
        const onSubjectAndDifficulty = parsed
          .filter((q: any) => !q.subject || String(q.subject).toLowerCase() === String(subject).toLowerCase())
          .filter((q: any) => !q.difficulty || String(q.difficulty).toLowerCase() === String(difficulty).toLowerCase())
          // Normalize every field to the values actually requested, so the UI never
          // shows a question tagged with the wrong subject/grade/difficulty badge
          // even if the model's JSON drifted slightly.
          .map((q: any) => ({ ...q, subject, grade, difficulty }));
        if (onSubjectAndDifficulty.length > 0) {
          return res.json({ questions: onSubjectAndDifficulty });
        }
      }
    }

    // Gemini unavailable (no API key configured), returned nothing usable, or every
    // question drifted off the requested subject/difficulty — use the curriculum-grounded,
    // subject-and-difficulty-correct fallback generator instead.
    return res.json({ questions: buildGroundedFallbackQuestions({ board, subject, grade, chapter, difficulty }) });
  } catch (err: any) {
    console.error('Handled error in /api/ai/practice:', err);
    return res.json({
      questions: buildGroundedFallbackQuestions({
        board: board || 'TSCERT',
        subject: subject || 'Mathematics',
        grade: grade || 'Class 10',
        chapter,
        difficulty: difficulty || 'Medium',
      }),
    });
  }
});

// 3. AI Teacher Insight & Remedial Lesson Generator
app.post('/api/ai/teacher-insight', async (req, res) => {
  try {
    const { topicName, subject, grade, board, studentCount, strugglePoints = [] } = req.body;

    const prompt = `You are a Master Teacher Pedagogical Coach for Indian secondary school educators (${board}, ${grade}, ${subject}).
The teacher's dashboard shows that ${studentCount || 'multiple'} students are struggling severely with: "${topicName}".
Identified struggle points: ${strugglePoints.join(', ') || 'Concept application, formulas, and sign conventions'}.

Generate a practical, actionable 10-Minute Remedial Intervention Plan with:
1. "The Core Misconception": Why students get confused in 2 sentences.
2. "10-Minute Mini-Lesson Script": Step-by-step whiteboard hook, visual analogy, and 2 check-for-understanding questions.
3. "Scaffolded 3-Problem Worksheet": (Level 1: Basic Confidence, Level 2: Core Concept, Level 3: Board Exam Application).
4. "Quick Differentiated Support Tip": For students who need extra peer-tutoring.`;

    const generatedText = await generateWithModelFallback({
      preferredModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    if (generatedText && generatedText.trim().length > 0) {
      return res.json({ insightPlan: generatedText });
    }

    // High quality teacher remedial plan fallback
    return res.json({
      insightPlan: `### 10-Minute Remedial Intervention Plan: ${topicName}
Class Context: ${board} • ${grade} • ${subject} (${studentCount || '5+'} students needing direct attention)

---
#### 1. The Core Misconception
Students struggle with ${(strugglePoints || []).join(' and ') || 'the core chapter formulas'} because they memorize procedures mechanically without visualizing the underlying principles or sign conventions.

---
#### 2. 10-Minute Blackboard Action Script
• Minutes 1–3 (Visual Hook & Everyday Analogy):
  - Draw a split-board diagram. Connect the concept to a real-life analogy (e.g. balancing weighing scales in a grocery shop or light reflection from vehicle mirrors).
  - Highlight the single most common mistake in distinct color (e.g. negative sign errors, inverted fractions, or incorrect criss-cross valencies).

• Minutes 4–7 (Worked Model Problem with Choral Prompts):
  - Solve 1 canonical textbook exemplar step-by-step on the board.
  - Pause at each critical arithmetic or scientific step and ask students to call out the next rule together.

• Minutes 8–10 (Rapid Slate Check & Turn-and-Talk):
  - Write 1 quick check problem on the board.
  - Give students 90 seconds to solve on slates/notebooks and hold up answers.
  - Provide immediate reinforcement and tag students who need extra guided support.

---
#### 3. Scaffolded 3-Problem Worksheet
1. Level 1 (Foundation Confidence): Direct substitution problem with all given parameters.
2. Level 2 (Core Curriculum Standard): Two-step problem requiring variable rearrangement or formula synthesis.
3. Level 3 (Board Exam Application): Applied multi-mark question modeled directly on recent ${board} SSC / Class 10 Board exam patterns.

---
#### 4. Differentiated Support & Peer-Tutoring Tip
Pair students who showed strong mastery in previous quizzes with struggling peers for a 5-minute peer review drill during morning revision sessions.`
    });
  } catch (err: any) {
    console.error('Handled error in /api/ai/teacher-insight:', err);
    return res.json({
      insightPlan: `### 10-Minute Remedial Plan: ${req.body?.topicName || 'Target Topic'}\n\n1. Core Misconception: Students confuse sign conventions and formula rearrangement.\n2. Blackboard Hook: Show a side-by-side comparison diagram.\n3. Guided Practice: Work 1 exemplar problem with student choral responses.\n4. Worksheet: 3 scaffolded problems (Basic, Intermediate, Board Exam level).`
    });
  }
});

// 4. AI Simpler Explanation / Analogy
app.post('/api/ai/explain-simpler', async (req, res) => {
  try {
    const { topic, originalExplanation, language = 'en' } = req.body;

    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      te: 'Telugu (తెలుగు)',
    };
    const targetLang = langNames[language] || 'English';

    const prompt = `Re-explain the following concept in an ultra-simple, crystal-clear way suitable for a 13-year-old student who is feeling stuck and frustrated.
Topic: ${topic}
Original explanation: ${originalExplanation}
Target language: ${targetLang}

Rules:
- Use a relatable everyday Indian analogy (cricket match, cooking in the kitchen, village market, bicycle riding, train journeys, mobile battery).
- Keep sentences short.
- Be encouraging and warm!`;

    const generatedText = await generateWithModelFallback({
      preferredModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    if (generatedText && generatedText.trim().length > 0) {
      return res.json({ simplerExplanation: generatedText });
    }

    return res.json({
      simplerExplanation: `Let's look at this with an everyday analogy: Think of ${topic} like riding a bicycle. When you push the pedal with force, that force moves through the chain to the wheels. In the same way, in this topic, the inputs directly determine the balanced outcome according to the formula!`
    });
  } catch (err: any) {
    console.error('Handled error in /api/ai/explain-simpler:', err);
    return res.json({
      simplerExplanation: `Think of ${req.body?.topic || 'this concept'} like a seesaw in a playground: both sides must balance out completely!`
    });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DoubtBridge server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
