import React, { useEffect, useState } from 'react';
import { BoardId, GradeId, InteractionLogEntry, LanguageCode, SessionUser } from './types';
import { Navbar } from './components/Navbar';
import { SelectorView } from './components/SelectorView';
import { ChatView } from './components/ChatView';
import { PracticeView } from './components/PracticeView';
import { ScholarshipView } from './components/ScholarshipView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { SessionLogModal } from './components/SessionLogModal';
import { AuthView } from './components/AuthView';
import * as authService from './services/authService';

export default function App() {
  // Session / Auth — resolved from the server (httpOnly cookie) on mount,
  // since the token itself is never readable from client-side JS.
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Navigation View: 'select' | 'chat' | 'practice' | 'scholarships' | 'teacher'
  const [currentView, setCurrentView] = useState<'select' | 'chat' | 'practice' | 'scholarships' | 'teacher'>('select');

  // Active Curriculum Context (defaults to the student's registered class once logged in)
  const [board, setBoard] = useState<BoardId>('NCERT');
  const [subject, setSubject] = useState<string>('Science');
  const [grade, setGrade] = useState<GradeId>('Class 10');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authService.getSession().then((user) => {
      if (cancelled) return;
      setSessionUser(user);
      if (user?.role === 'teacher') {
        setCurrentView('teacher');
      } else if (user?.role === 'student') {
        setGrade(user.account.grade);
      }
      setIsCheckingSession(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Interaction logs (starts with realistic secondary session records)
  const [sessionLogs, setSessionLogs] = useState<InteractionLogEntry[]>([
    {
      id: 'log-seed-1',
      studentId: 'student_seed_1',
      board: 'NCERT',
      subject: 'Mathematics',
      grade: 'Class 10',
      topic: 'Chapter 4: Quadratic Equations · 4.3 Factorisation',
      question: 'How do I split the middle term in quadratic equations step by step?',
      language: 'en',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      helpful: true,
    },
    {
      id: 'log-seed-2',
      studentId: 'student_seed_2',
      board: 'NCERT',
      subject: 'Science',
      grade: 'Class 10',
      topic: 'Chapter 10: Light · 10.2 Spherical Mirrors',
      question: 'Why do convex mirrors have a wider field of view than flat mirrors?',
      language: 'en',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      helpful: true,
    },
  ]);

  const handleRecordLogEntry = (entry: InteractionLogEntry) => {
    setSessionLogs((prev) => [...prev, entry]);
  };

  const handleStartChatFromSelector = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    } else {
      setInitialPrompt(null);
    }
    setCurrentView('chat');
  };

  const handleOpenPracticeWithTopic = (topicName: string) => {
    setSubject(topicName);
    setCurrentView('practice');
  };

  const handleResetContext = () => {
    setCurrentView('select');
  };

  const handleAuthenticated = (user: SessionUser) => {
    setSessionUser(user);
    if (user.role === 'student') {
      setGrade(user.account.grade);
      setCurrentView('select');
    } else {
      setCurrentView('teacher');
    }
  };

  const handleLogout = async () => {
    await authService.clearSession();
    setSessionUser(null);
    setCurrentView('select');
  };

  // Wait for the session check (cookie -> server round trip) before deciding
  // whether to show the app or the login screen.
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#221631]">
        <div className="text-[#FFF6E9] text-sm font-bold">Loading…</div>
      </div>
    );
  }

  // Require login before anything else is shown
  if (!sessionUser) {
    return <AuthView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF6E9] text-[#1B1330] flex flex-col font-sans selection:bg-[#FFB937]/30">
      {/* Universal Top Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        board={board}
        subject={subject}
        grade={grade}
        language={language}
        onLanguageChange={(l) => setLanguage(l)}
        onOpenLog={() => setIsLogModalOpen(true)}
        onResetContext={handleResetContext}
        sessionUser={sessionUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {sessionUser.role === 'student' && currentView === 'select' && (
          <SelectorView
            selectedBoard={board}
            selectedSubject={subject}
            selectedGrade={grade}
            selectedLanguage={language}
            onSelectBoard={(b) => setBoard(b)}
            onSelectSubject={(s) => setSubject(s)}
            onSelectGrade={(g) => setGrade(g)}
            onSelectLanguage={(l) => setLanguage(l)}
            onStartChat={handleStartChatFromSelector}
          />
        )}

        {sessionUser.role === 'student' && currentView === 'chat' && (
          <ChatView
            board={board}
            subject={subject}
            grade={grade}
            language={language}
            initialPrompt={initialPrompt}
            onBackToSelector={() => setCurrentView('select')}
            onOpenPracticeWithTopic={handleOpenPracticeWithTopic}
            onRecordLogEntry={handleRecordLogEntry}
          />
        )}

        {sessionUser.role === 'student' && currentView === 'practice' && (
          <PracticeView
            board={board}
            subject={subject}
            grade={grade}
            language={language}
            onAskDoubtFromQuestion={(qText) => {
              setInitialPrompt(qText);
              setCurrentView('chat');
            }}
          />
        )}

        {sessionUser.role === 'student' && currentView === 'scholarships' && (
          <ScholarshipView grade={grade} board={board} />
        )}

        {sessionUser.role === 'teacher' && (
          <TeacherDashboardView teacher={sessionUser.account} onBackToStudent={handleLogout} />
        )}
      </main>

      {/* Session Log Modal */}
      <SessionLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        logs={sessionLogs}
      />
    </div>
  );
}
