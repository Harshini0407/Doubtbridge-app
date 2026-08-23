import React from 'react';
import { BoardId, GradeId, LanguageCode, SessionUser } from '../types';
import { BookOpen, Sparkles, Award, Users, Globe, FileText, RotateCcw, LogOut, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentView: 'select' | 'chat' | 'practice' | 'scholarships' | 'teacher';
  onNavigate: (view: 'select' | 'chat' | 'practice' | 'scholarships' | 'teacher') => void;
  board: BoardId | null;
  subject: string | null;
  grade: GradeId | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenLog: () => void;
  onResetContext: () => void;
  sessionUser: SessionUser;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  board,
  subject,
  grade,
  language,
  onLanguageChange,
  onOpenLog,
  onResetContext,
  sessionUser,
  onLogout,
}) => {
  const isContextConfigured = board && subject && grade;
  const isStudent = sessionUser.role === 'student';
  const displayName = isStudent ? sessionUser.account.username : sessionUser.account.teacherCode;

  return (
    <header className="sticky top-0 z-30 bg-[#221631] text-[#FFF6E9] border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
          onClick={() => onNavigate(isStudent ? 'select' : 'teacher')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5F4E] via-[#FFB937] to-[#FFD873] flex items-center justify-center shadow-lg shadow-[#FF5F4E]/30">
            <Sparkles className="w-4 h-4 text-[#1B1330]" />
          </div>
          <div>
            <div className="font-display font-bold text-base tracking-tight leading-none text-white flex items-center gap-1.5">
              DoubtBridge
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FF5F4E]/20 text-[#FFB937] border border-[#FFB937]/30">
                Secondary AI
              </span>
            </div>
            <div className="text-[11px] text-[#D9C9E6] leading-none mt-0.5 hidden sm:block">
              Equitable Education for Class 5–10
            </div>
          </div>
        </div>

        {/* Center Nav tabs */}
        {isStudent ? (
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              id="nav-doubt-solver-btn"
              type="button"
              onClick={() => onNavigate(isContextConfigured ? 'chat' : 'select')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'chat' || currentView === 'select'
                  ? 'bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] shadow-sm font-bold'
                  : 'text-[#D9C9E6] hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Doubt Solver
            </button>

            <button
              id="nav-adaptive-practice-btn"
              type="button"
              onClick={() => onNavigate('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'practice'
                  ? 'bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] shadow-sm font-bold'
                  : 'text-[#D9C9E6] hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Practice
            </button>

            <button
              id="nav-scholarships-btn"
              type="button"
              onClick={() => onNavigate('scholarships')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'scholarships'
                  ? 'bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] shadow-sm font-bold'
                  : 'text-[#D9C9E6] hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Scholarships & Aid
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330]">
              <Users className="w-3.5 h-3.5" />
              Teacher Hub · {sessionUser.account.classTaught}
            </div>
          </nav>
        )}

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Active Context pill (students only) */}
          {isStudent && isContextConfigured && (
            <button
              id="active-curriculum-pill"
              type="button"
              onClick={onResetContext}
              title="Click to switch Board, Subject, or Grade"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFB937]/15 border border-[#FFB937]/40 text-[#FFD873] text-[11px] font-semibold hover:bg-[#FFB937]/25 transition"
            >
              <span>{board}</span>
              <span className="opacity-50">·</span>
              <span className="truncate max-w-[100px]">{subject}</span>
              <span className="opacity-50">·</span>
              <span>{grade}</span>
              <RotateCcw className="w-3 h-3 ml-0.5 opacity-80" />
            </button>
          )}

          {/* Language Selector (students only) */}
          {isStudent && (
            <div className="relative inline-block text-left">
              <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-lg px-2 py-1">
                <Globe className="w-3.5 h-3.5 text-[#FFB937]" />
                <select
                  id="language-select"
                  aria-label="Select Interface and AI Response Language"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="bg-transparent text-xs font-semibold text-[#FFF6E9] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="en" className="bg-[#221631] text-white">English</option>
                  <option value="hi" className="bg-[#221631] text-white">हिंदी (Hindi)</option>
                  <option value="te" className="bg-[#221631] text-white">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          )}

          {/* Session Log Button (students only) */}
          {isStudent && (
            <button
              id="session-log-header-btn"
              type="button"
              onClick={onOpenLog}
              title="View student doubt interaction log"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFF6E9] border border-white/15 transition flex items-center gap-1 text-xs font-semibold"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Log</span>
            </button>
          )}

          {/* Account chip + Logout */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-[#FFF6E9]">
            <GraduationCap className="w-3.5 h-3.5 text-[#FFB937]" />
            <span className="truncate max-w-[100px]">{displayName}</span>
          </div>
          <button
            id="logout-btn"
            type="button"
            onClick={onLogout}
            title="Log out"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFF6E9] border border-white/15 transition flex items-center gap-1 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {isStudent && (
        <div className="flex md:hidden items-center justify-around bg-[#1B1330] px-2 py-1.5 border-t border-white/10 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => onNavigate(isContextConfigured ? 'chat' : 'select')}
            className={`px-2 py-1 rounded ${currentView === 'chat' || currentView === 'select' ? 'text-[#FFB937] font-bold' : 'text-[#D9C9E6]'}`}
          >
            Doubt Chat
          </button>
          <button
            type="button"
            onClick={() => onNavigate('practice')}
            className={`px-2 py-1 rounded ${currentView === 'practice' ? 'text-[#FFB937] font-bold' : 'text-[#D9C9E6]'}`}
          >
            Practice
          </button>
          <button
            type="button"
            onClick={() => onNavigate('scholarships')}
            className={`px-2 py-1 rounded ${currentView === 'scholarships' ? 'text-[#FFB937] font-bold' : 'text-[#D9C9E6]'}`}
          >
            Scholarships
          </button>
        </div>
      )}
    </header>
  );
};
