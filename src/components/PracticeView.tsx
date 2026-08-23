import React, { useState } from 'react';
import { BoardId, GradeId, LanguageCode, PracticeQuestion } from '../types';
import { INITIAL_PRACTICE_QUESTIONS } from '../data/mockTeacherData';
import { fetchAdaptivePractice } from '../services/apiService';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Trophy,
  Flame,
  Award,
  Zap
} from 'lucide-react';

interface PracticeViewProps {
  board: BoardId;
  subject: string;
  grade: GradeId;
  language: LanguageCode;
  onAskDoubtFromQuestion: (questionText: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  board,
  subject,
  grade,
  language,
  onAskDoubtFromQuestion,
}) => {
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Challenging'>('Medium');

  // Helper to get matching questions from catalog
  const getCatalogQuestions = (diff: 'Easy' | 'Medium' | 'Challenging') => {
    return INITIAL_PRACTICE_QUESTIONS.filter(
      (q) =>
        q.grade === grade &&
        (q.subject === subject || subject.includes(q.subject) || q.subject.includes(subject)) &&
        q.difficulty === diff
    );
  };

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => {
    const diffMatch = getCatalogQuestions('Medium');
    if (diffMatch.length > 0) return diffMatch;
    const gradeMatch = INITIAL_PRACTICE_QUESTIONS.filter(
      (q) => q.grade === grade && (q.subject === subject || subject.includes(q.subject))
    );
    return gradeMatch.length > 0 ? gradeMatch : INITIAL_PRACTICE_QUESTIONS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle difficulty switch: instantly load questions for that difficulty or generate if needed
  const handleDifficultyChange = async (newDiff: 'Easy' | 'Medium' | 'Challenging') => {
    setDifficulty(newDiff);
    setCurrentIndex(0);

    const matching = INITIAL_PRACTICE_QUESTIONS.filter(
      (q) =>
        (q.grade === grade || true) &&
        (q.subject === subject || subject.includes(q.subject) || q.subject.includes(subject) || q.subject === 'Science' || q.subject === 'Mathematics') &&
        q.difficulty === newDiff
    );

    if (matching.length > 0) {
      setQuestions(matching);
    } else {
      // Fetch new ones for this difficulty
      setIsGenerating(true);
      try {
        const newQs = await fetchAdaptivePractice({
          board,
          subject,
          grade,
          difficulty: newDiff,
        });
        if (newQs && newQs.length > 0) {
          setQuestions(newQs);
        }
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const currentQ = questions[currentIndex] || questions[0];
  const totalQ = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const score = Object.entries(selectedAnswers).reduce((acc, [qId, ansIdx]) => {
    const q = questions.find((item) => item.id === qId);
    return q && q.correctIndex === ansIdx ? acc + 1 : acc;
  }, 0);

  const handleSelectOption = (index: number) => {
    if (selectedAnswers[currentQ.id] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: index,
    }));
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const newQs = await fetchAdaptivePractice({
        board,
        subject,
        grade,
        chapter: currentQ?.chapter,
        difficulty,
      });

      if (newQs && newQs.length > 0) {
        setQuestions((prev) => [...prev, ...newQs]);
        setCurrentIndex(questions.length);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const hasAnsweredCurrent = selectedAnswers[currentQ?.id] !== undefined;
  const isCurrentCorrect = selectedAnswers[currentQ?.id] === currentQ?.correctIndex;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#221631] to-[#3C1F4D] text-[#FFF6E9] p-6 rounded-3xl shadow-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-[#FF5F4E]/20 text-[#FFB937] border border-[#FFB937]/30">
              <Zap className="w-4 h-4" />
            </span>
            <h1 className="font-display text-xl font-bold text-white">Adaptive Practice Generator</h1>
          </div>
          <p className="text-xs text-[#D9C9E6]">
            Tailored secondary drills designed around known student confusions in {board} · {subject} · {grade}.
          </p>
        </div>

        {/* Live Scorecard */}
        <div className="flex items-center gap-4 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-[#FFB937] tracking-wider">Score</div>
            <div className="font-display font-bold text-lg text-white">
              {score} / {answeredCount}
            </div>
          </div>
          <div className="h-7 w-[1px] bg-white/20" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-[#D9C9E6] tracking-wider">Progress</div>
            <div className="font-display font-bold text-lg text-white">
              {currentIndex + 1} / {totalQ}
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty & Chapter Selector bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E3D6BC] shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1B1330]">Difficulty:</span>
          {(['Easy', 'Medium', 'Challenging'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleDifficultyChange(lvl)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                difficulty === lvl
                  ? 'bg-[#1B1330] text-[#FFF6E9] border-[#1B1330] shadow-sm'
                  : 'bg-[#FFF6E9] text-[#8A7A5C] border-[#E3D6BC] hover:border-[#FF5F4E]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateMore}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] font-bold flex items-center gap-1.5 hover:shadow-md transition active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGenerating ? 'Generating AI questions…' : 'Generate More Practice'}</span>
        </button>
      </div>

      {/* Main Question Card */}
      {currentQ ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3D6BC] shadow-md flex flex-col gap-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between border-b border-[#E3D6BC] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold px-2.5 py-1 rounded-full bg-[#F3ECDD] text-[#5A4E38]">
                Question {currentIndex + 1}
              </span>
              <span className="text-[#8A7A5C] font-semibold">{currentQ.chapter}</span>
            </div>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                currentQ.difficulty === 'Easy'
                  ? 'bg-[#2E8B6F]/15 text-[#2E8B6F]'
                  : currentQ.difficulty === 'Medium'
                  ? 'bg-[#FFB937]/20 text-[#8A7A5C]'
                  : 'bg-[#FF5F4E]/15 text-[#FF5F4E]'
              }`}
            >
              {currentQ.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#1B1330] leading-snug">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              const isCorrectOpt = idx === currentQ.correctIndex;
              let btnClass = 'border-[#E3D6BC] bg-[#FFF6E9] hover:border-[#FF5F4E] text-[#1B1330]';

              if (hasAnsweredCurrent) {
                if (isCorrectOpt) {
                  btnClass = 'border-[#2E8B6F] bg-[#2E8B6F]/10 text-[#2E8B6F] font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  btnClass = 'border-[#FF5F4E] bg-[#FF5F4E]/10 text-[#FF5F4E]';
                } else {
                  btnClass = 'opacity-50 border-[#E3D6BC] bg-white';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={hasAnsweredCurrent}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between text-sm sm:text-base ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-white border border-[#E3D6BC] flex items-center justify-center font-display font-bold text-xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasAnsweredCurrent && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-[#2E8B6F]" />
                  )}
                  {hasAnsweredCurrent && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-[#FF5F4E]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint Trigger */}
          {!hasAnsweredCurrent && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setShowHint((prev) => ({
                    ...prev,
                    [currentQ.id]: !prev[currentQ.id],
                  }))
                }
                className="text-xs text-[#8A7A5C] hover:text-[#1B1330] flex items-center gap-1 font-semibold underline decoration-dashed"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#FFB937]" />
                <span>{showHint[currentQ.id] ? 'Hide Hint' : 'Need a hint?'}</span>
              </button>

              {showHint[currentQ.id] && (
                <div className="mt-2 p-3 bg-[#FFF9F0] border border-[#F0DDBA] rounded-xl text-xs text-[#5A4E38] animate-fadeIn">
                  💡 <b>Hint:</b> {currentQ.hint}
                </div>
              )}
            </div>
          )}

          {/* Solution & Explanation Box */}
          {hasAnsweredCurrent && (
            <div
              className={`p-5 rounded-2xl border space-y-3 animate-fadeIn ${
                isCurrentCorrect
                  ? 'bg-[#2E8B6F]/5 border-[#2E8B6F]/30 text-[#1B1330]'
                  : 'bg-[#FF5F4E]/5 border-[#FF5F4E]/30 text-[#1B1330]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-bold text-sm">
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#2E8B6F]" />
                      <span className="text-[#2E8B6F]">Spot on! Correct answer.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#FF5F4E]" />
                      <span className="text-[#FF5F4E]">Not quite. Let's learn why:</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onAskDoubtFromQuestion(
                      `I was practicing this question: "${currentQ.question}". Can you explain why the answer is "${currentQ.options[currentQ.correctIndex]}" step by step?`
                    )
                  }
                  className="text-xs font-bold text-[#FF5F4E] hover:underline flex items-center gap-1"
                >
                  <span>Ask tutor about this doubt →</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-[#4A3F30]">
                <b>Step-by-Step Explanation:</b>
                <div className="mt-1">{currentQ.explanation}</div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E3D6BC]">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E3D6BC] text-[#8A7A5C] hover:bg-[#FFF6E9] disabled:opacity-40"
            >
              ← Previous
            </button>

            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentIndex === i
                      ? 'bg-[#FF5F4E] scale-125'
                      : selectedAnswers[questions[i]?.id] !== undefined
                      ? 'bg-[#2E8B6F]'
                      : 'bg-[#E3D6BC]'
                  }`}
                  title={`Question ${i + 1}`}
                />
              ))}
            </div>

            {currentIndex < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1B1330] text-white hover:bg-[#221631]"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateMore}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF5F4E] text-white hover:bg-[#FF5F4E]/90"
              >
                {isGenerating ? 'Generating…' : 'More Practice →'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl text-center border border-[#E3D6BC]">
          <p className="text-sm text-[#8A7A5C]">No questions loaded for this subject. Click above to generate!</p>
        </div>
      )}
    </div>
  );
};
