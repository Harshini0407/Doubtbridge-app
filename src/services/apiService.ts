import { BoardId, GradeId, KnowledgeChunk, LanguageCode, PracticeQuestion } from '../types';
import { KNOWLEDGE_BASE } from '../data/curriculumData';

export function detectLanguage(text: string): { code: LanguageCode; name: string } {
  if (/[\u0900-\u097F]/.test(text)) return { code: 'hi', name: 'Hindi (हिंदी)' };
  if (/[\u0C00-\u0C7F]/.test(text)) return { code: 'te', name: 'Telugu (తెలుగు)' };
  return { code: 'en', name: 'English' };
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function findCurriculumChunk(
  board: BoardId,
  subject: string,
  grade: GradeId,
  question: string
): KnowledgeChunk | null {
  // Hard isolation by Board, Grade, and Subject
  const pool = KNOWLEDGE_BASE.filter(
    (entry) =>
      entry.board === board &&
      entry.grade === grade &&
      (entry.subject.toLowerCase() === subject.toLowerCase() ||
       subject.toLowerCase().includes(entry.subject.toLowerCase()) ||
       entry.subject.toLowerCase().includes(subject.toLowerCase()))
  );

  const qTokens = tokenize(question);
  let best: KnowledgeChunk | null = null;
  let bestScore = 0;

  pool.forEach((entry) => {
    const haystack = tokenize(
      `${entry.content} ${entry.keywords.join(' ')} ${entry.chapter} ${entry.section} ${(entry.keyFormulas || []).join(' ')}`
    );
    let score = 0;
    qTokens.forEach((token) => {
      if (token.length < 3) return;
      if (haystack.includes(token)) score += 1.2;
      entry.keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(token)) score += 2.0;
      });
    });

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  if (!best || bestScore < 1.0) {
    // If pool has items and user asks generic question about the subject, pick closest subject chunk
    if (pool.length > 0 && question.trim().length > 15) {
      return pool[0];
    }
    return null;
  }

  return best;
}

export async function askDoubt(params: {
  board: BoardId;
  subject: string;
  grade: GradeId;
  question: string;
  language: LanguageCode;
  matchedChunk: KnowledgeChunk | null;
}) {
  try {
    const res = await fetch('/api/ai/doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    if (params.matchedChunk) {
      return {
        answer: `${params.matchedChunk.content}\n\n**Key Formulas & Concepts:**\n${(params.matchedChunk.keyFormulas || []).map(f => `• ${f}`).join('\n')}`,
        grounded: true,
        source: {
          textbook: params.matchedChunk.textbook,
          chapter: params.matchedChunk.chapter,
          section: params.matchedChunk.section,
        },
      };
    }
    return {
      answer: `I could not find a direct match in your ${params.board} ${params.grade} ${params.subject} textbook for this query. Could you try rephrasing with specific key terms?`,
      grounded: false,
      notFound: true,
    };
  }
}

export async function fetchAdaptivePractice(params: {
  board: BoardId;
  subject: string;
  grade: GradeId;
  chapter?: string;
  difficulty?: 'Easy' | 'Medium' | 'Challenging';
  recentMistakes?: string[];
}): Promise<PracticeQuestion[]> {
  try {
    const res = await fetch('/api/ai/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (e) {
    console.warn('Failed practice query, fallback will be used', e);
  }
  return [];
}

export async function fetchTeacherInsight(params: {
  topicName: string;
  subject: string;
  grade: GradeId;
  board: BoardId;
  studentCount: number;
  strugglePoints: string[];
}): Promise<string> {
  try {
    const res = await fetch('/api/ai/teacher-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.insightPlan && data.insightPlan.trim().length > 0) {
        return data.insightPlan;
      }
    }
  } catch (e) {
    console.error('Failed to get teacher insight:', e);
  }

  // High-quality pedagogical fallback plan
  return `### 10-Minute Remedial Intervention Plan: ${params.topicName}
**Class Context:** ${params.board} • ${params.grade} • ${params.subject} (${params.studentCount} students needing direct attention)

---
#### 1. The Core Misconception
Students struggle with ${(params.strugglePoints || []).join(' and ') || 'the core chapter formulas'} because they memorize procedures mechanically without visualizing the underlying principles or sign conventions.

---
#### 2. 10-Minute Blackboard Action Script
• **Minutes 1–3 (Visual Hook & Everyday Analogy):**
  - Draw a split-board diagram. Connect the concept to a real-life analogy (e.g. balancing weighing scales in a grocery shop or light reflection from vehicle mirrors).
  - Highlight the single most common mistake in distinct color (e.g. negative sign errors, inverted fractions, or incorrect criss-cross valencies).

• **Minutes 4–7 (Worked Model Problem with Choral Prompts):**
  - Solve 1 canonical textbook exemplar step-by-step on the board.
  - Pause at each critical arithmetic or scientific step and ask students to call out the next rule together.

• **Minutes 8–10 (Rapid Slate Check & Turn-and-Talk):**
  - Write 1 quick check problem on the board.
  - Give students 90 seconds to solve on slates/notebooks and hold up answers.
  - Provide immediate reinforcement and tag students who need extra guided support.

---
#### 3. Scaffolded 3-Problem Worksheet
1. **Level 1 (Foundation Confidence):** Direct substitution problem with all given parameters.
2. **Level 2 (Core Curriculum Standard):** Two-step problem requiring variable rearrangement or formula synthesis.
3. **Level 3 (Board Exam Application):** Applied multi-mark question modeled directly on recent ${params.board} SSC / Class 10 Board exam patterns.

---
#### 4. Differentiated Support & Peer-Tutoring Tip
Pair students who showed strong mastery in previous quizzes with struggling peers for a 5-minute peer review drill during morning revision sessions.`;
}

export async function simplifyExplanation(params: {
  topic: string;
  originalExplanation: string;
  language: LanguageCode;
}): Promise<string> {
  try {
    const res = await fetch('/api/ai/explain-simpler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      return data.simplerExplanation || '';
    }
  } catch (e) {
    console.error('Failed to simplify:', e);
  }
  return 'Here is the simplest summary: Always identify what is given first, choose the matching equation, and substitute carefully!';
}
