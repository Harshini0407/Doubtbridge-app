import React, { useState } from 'react';
import { BoardId, GradeId, LanguageCode, SubjectOption } from '../types';
import { SUBJECTS, FREQUENT_DOUBT_PROMPTS, GRADE_OPTIONS } from '../data/curriculumData';
import { ArrowRight, Sparkles, Check, BookOpen, Lightbulb, GraduationCap, ShieldCheck, Languages } from 'lucide-react';

interface SelectorViewProps {
  selectedBoard: BoardId | null;
  selectedSubject: string | null;
  selectedGrade: GradeId | null;
  selectedLanguage: LanguageCode;
  onSelectBoard: (board: BoardId) => void;
  onSelectSubject: (subject: string) => void;
  onSelectGrade: (grade: GradeId) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onStartChat: (initialPrompt?: string) => void;
}

export const SelectorView: React.FC<SelectorViewProps> = ({
  selectedBoard,
  selectedSubject,
  selectedGrade,
  selectedLanguage,
  onSelectBoard,
  onSelectSubject,
  onSelectGrade,
  onSelectLanguage,
  onStartChat,
}) => {
  const [activeTabPrompt, setActiveTabPrompt] = useState<string | null>(null);

  // Available subjects filtered by the chosen board (or general)
  const availableSubjects = SUBJECTS.filter((s) => !selectedBoard || s.board === selectedBoard);

  // Sun completion math
  const litCount = (selectedBoard ? 1 : 0) + (selectedSubject ? 1 : 0) + (selectedGrade ? 1 : 0);
  const isReady = Boolean(selectedBoard && selectedSubject && selectedGrade);

  // Suggested prompts for the chosen subject
  const currentPrompts = selectedSubject
    ? FREQUENT_DOUBT_PROMPTS[selectedSubject] || FREQUENT_DOUBT_PROMPTS['Science']
    : ['How do I split the middle term in quadratic equations?', 'Why do convex mirrors have a wider field of view?', 'Explain the 3 equations of motion step by step.'];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start bg-gradient-to-b from-[#221631] via-[#2B1A3D] to-[#3C1F4D] px-4 py-8 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-[-50px] left-[-50px] w-72 h-72 rounded-full bg-[#FF5F4E]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-36 right-[-60px] w-80 h-80 rounded-full bg-[#FFB937]/15 blur-3xl pointer-events-none" />

      {/* Main card container */}
      <div className="w-full max-w-2xl flex flex-col relative z-10">
        {/* Hero Section */}
        <div className="text-center pt-2 pb-6 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB937]/15 border border-[#FFB937]/35 text-[#FFB937] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI for Equitable Education Access
          </div>

          {/* Animated Sun Progress SVG */}
          <div className="flex justify-center my-1">
            <svg viewBox="0 0 320 160" className="w-48 h-auto" aria-hidden="true">
              <defs>
                <radialGradient id="sunGradSelector" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#FFD873" />
                  <stop offset="55%" stopColor="#FFB937" />
                  <stop offset="100%" stopColor="#FF5F4E" />
                </radialGradient>
                <filter id="glowSelector" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Rays */}
              <line
                x1="128" y1="74" x2="92" y2="34"
                stroke={litCount >= 1 ? 'url(#sunGradSelector)' : '#4A3560'}
                strokeWidth="6"
                strokeLinecap="round"
                style={{ opacity: litCount >= 1 ? 1 : 0.4, transition: 'all 400ms ease' }}
              />
              <line
                x1="160" y1="60" x2="160" y2="10"
                stroke={litCount >= 2 ? 'url(#sunGradSelector)' : '#4A3560'}
                strokeWidth="6"
                strokeLinecap="round"
                style={{ opacity: litCount >= 2 ? 1 : 0.4, transition: 'all 400ms ease' }}
              />
              <line
                x1="192" y1="74" x2="228" y2="34"
                stroke={litCount >= 3 ? 'url(#sunGradSelector)' : '#4A3560'}
                strokeWidth="6"
                strokeLinecap="round"
                style={{ opacity: litCount >= 3 ? 1 : 0.4, transition: 'all 400ms ease' }}
              />

              {/* Outer soft glow */}
              <circle
                cx="160"
                cy="105"
                r="64"
                fill="#FFB937"
                opacity={0.15 + litCount * 0.08}
                filter="url(#glowSelector)"
              />
              {/* Sun body */}
              <circle
                cx="160"
                cy="105"
                r="44"
                fill="url(#sunGradSelector)"
                filter={litCount > 0 ? 'url(#glowSelector)' : undefined}
              />
              {/* Dim layer when not fully selected */}
              <circle
                cx="160"
                cy="105"
                r="44"
                fill="#221631"
                opacity={litCount === 3 ? 0 : (3 - litCount) * 0.18}
                style={{ transition: 'opacity 400ms ease' }}
              />
            </svg>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFF6E9] tracking-tight mt-1">
            Let's clear that doubt.
          </h1>
          <p className="text-[#D9C9E6] text-sm sm:text-base max-w-lg mx-auto mt-2 leading-relaxed">
            Pick your curriculum board, subject, and grade — every answer is directly grounded in your textbook with page citations.
          </p>
        </div>

        {/* Step-by-Step Panel */}
        <div className="bg-[#FFF6E9] rounded-3xl p-6 sm:p-8 text-[#1B1330] shadow-2xl border border-[#E3D6BC] flex flex-col gap-6">
          {/* Step 1: Board Selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs transition-colors ${
                  selectedBoard ? 'bg-[#FF5F4E] text-white' : 'bg-[#EADFC9] text-[#8A7A5C]'
                }`}
              >
                1
              </span>
              <h2 className="font-display font-bold text-base text-[#1B1330]">
                Select Your Educational Board
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* NCERT Tile */}
              <button
                id="tile-ncert-btn"
                type="button"
                onClick={() => onSelectBoard('NCERT')}
                className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col gap-1 ${
                  selectedBoard === 'NCERT'
                    ? 'bg-[#1B1330] text-[#FFF6E9] border-[#1B1330] shadow-[0_6px_0_0_#FF5F4E] transform -translate-y-0.5'
                    : 'border-[#E3D6BC] hover:border-[#FF5F4E] bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg">NCERT</span>
                  {selectedBoard === 'NCERT' && <Check className="w-5 h-5 text-[#FFB937]" />}
                </div>
                <span className={`text-xs ${selectedBoard === 'NCERT' ? 'text-[#E3D6BC]' : 'text-[#8A7A5C]'}`}>
                  National CBSE & Central Schools Syllabus
                </span>
              </button>

              {/* TSCERT Tile */}
              <button
                id="tile-tscert-btn"
                type="button"
                onClick={() => onSelectBoard('TSCERT')}
                className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col gap-1 ${
                  selectedBoard === 'TSCERT'
                    ? 'bg-[#1B1330] text-[#FFF6E9] border-[#1B1330] shadow-[0_6px_0_0_#FF5F4E] transform -translate-y-0.5'
                    : 'border-[#E3D6BC] hover:border-[#FF5F4E] bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg">TSCERT</span>
                  {selectedBoard === 'TSCERT' && <Check className="w-5 h-5 text-[#FFB937]" />}
                </div>
                <span className={`text-xs ${selectedBoard === 'TSCERT' ? 'text-[#E3D6BC]' : 'text-[#8A7A5C]'}`}>
                  Telangana State SSC Board Curriculum
                </span>
              </button>
            </div>
          </div>

          {/* Step 2: Subject Selection */}
          {selectedBoard && (
            <div className="flex flex-col gap-3 pt-2 border-t border-[#E3D6BC]/60 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs transition-colors ${
                    selectedSubject ? 'bg-[#FF5F4E] text-white' : 'bg-[#EADFC9] text-[#8A7A5C]'
                  }`}
                >
                  2
                </span>
                <h2 className="font-display font-bold text-base text-[#1B1330]">
                  Choose Your Subject
                </h2>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {availableSubjects.map((sub) => {
                  const isSelected = selectedSubject === sub.name;
                  return (
                    <button
                      key={sub.id}
                      id={`subject-chip-${sub.name.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => onSelectSubject(sub.name)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#1B1330] text-[#FFF6E9] border-[#1B1330] shadow-[0_4px_0_0_#FF5F4E]'
                          : 'border-[#E3D6BC] text-[#4A3F30] hover:border-[#FF5F4E] bg-white'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 opacity-70" />
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Grade Selection */}
          {selectedSubject && (
            <div className="flex flex-col gap-3 pt-2 border-t border-[#E3D6BC]/60 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs transition-colors ${
                    selectedGrade ? 'bg-[#FF5F4E] text-white' : 'bg-[#EADFC9] text-[#8A7A5C]'
                  }`}
                >
                  3
                </span>
                <h2 className="font-display font-bold text-base text-[#1B1330]">
                  Select Class / Grade
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    id={`grade-${g.toLowerCase().replace(/\s+/g, '-')}-btn`}
                    type="button"
                    onClick={() => onSelectGrade(g)}
                    className={`py-3.5 px-4 rounded-2xl text-center font-display font-bold text-base border-2 transition-all ${
                      selectedGrade === g
                        ? 'bg-[#1B1330] text-[#FFF6E9] border-[#1B1330] shadow-[0_5px_0_0_#FF5F4E]'
                        : 'border-[#E3D6BC] text-[#4A3F30] hover:border-[#FF5F4E] bg-white'
                    }`}
                  >
                    {g === 'Class 10' ? 'Class 10 (Board)' : g}
                  </button>
                ))}
              </div>
              {(selectedGrade === 'Class 5' ||
                selectedGrade === 'Class 6' ||
                selectedGrade === 'Class 7' ||
                selectedGrade === 'Class 8') && (
                <p className="text-[11px] text-[#8A7A5C] bg-[#F3ECDD] border border-[#E3D6BC] rounded-xl px-3 py-2">
                  Full grounded textbook answers are currently richest for Class 9 & 10. For {selectedGrade}, the AI tutor will
                  still try to help and will say so clearly if it can't find an exact textbook match yet.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Language Selection */}
          {selectedGrade && (
            <div className="flex flex-col gap-3 pt-2 border-t border-[#E3D6BC]/60 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#FF5F4E] text-white flex items-center justify-center font-display font-bold text-xs">
                    4
                  </span>
                  <h2 className="font-display font-bold text-base text-[#1B1330]">
                    Explanation Language
                  </h2>
                </div>
                <span className="text-xs text-[#8A7A5C] flex items-center gap-1 font-semibold">
                  <Languages className="w-3.5 h-3.5 text-[#FF5F4E]" /> Multilingual
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { code: 'en', label: 'English', sub: 'Standard' },
                  { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
                  { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
                ].map((l) => (
                  <button
                    key={l.code}
                    id={`lang-btn-${l.code}`}
                    type="button"
                    onClick={() => onSelectLanguage(l.code as LanguageCode)}
                    className={`py-2.5 px-2 rounded-xl text-center border-2 transition-all ${
                      selectedLanguage === l.code
                        ? 'bg-[#1B1330] text-[#FFF6E9] border-[#1B1330] shadow-[0_3px_0_0_#FF5F4E]'
                        : 'border-[#E3D6BC] text-[#4A3F30] hover:border-[#FF5F4E] bg-white'
                    }`}
                  >
                    <div className="font-bold text-sm leading-tight">{l.label}</div>
                    <div className="text-[10px] opacity-70 leading-tight mt-0.5">{l.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Question Prompts for this setup */}
          {isReady && (
            <div className="bg-[#F3ECDD] rounded-2xl p-4 border border-[#E3D6BC] flex flex-col gap-2.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A4E38]">
                <Lightbulb className="w-4 h-4 text-[#FF5F4E]" />
                <span>Frequently Asked Doubts in {selectedGrade} {selectedSubject}:</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {currentPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onStartChat(prompt)}
                    className="text-left text-xs bg-white hover:bg-[#FFF9F0] border border-[#E3D6BC] hover:border-[#FF5F4E] px-3 py-2 rounded-xl text-[#1B1330] transition flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">"{prompt}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A7A5C] group-hover:text-[#FF5F4E] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="pt-2">
            <button
              id="start-doubt-solving-btn"
              type="button"
              disabled={!isReady}
              onClick={() => onStartChat()}
              className={`w-full py-4 px-6 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                isReady
                  ? 'bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] cursor-pointer hover:shadow-xl hover:shadow-[#FF5F4E]/30 active:scale-[0.98]'
                  : 'bg-[#EADFC9] text-[#B7A886] cursor-not-allowed shadow-none'
              }`}
            >
              <span>{isReady ? `Start Grounded Doubts (${selectedBoard} · ${selectedGrade}) →` : 'Select Board, Subject & Grade to begin'}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-center text-xs text-[#8A7A5C] mt-3 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#2E8B6F]" />
              <span>Answers are verified against open state & central textbooks. Zero fabricated sources.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
