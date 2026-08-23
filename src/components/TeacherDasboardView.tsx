import React, { useEffect, useState } from 'react';
import { BoardId, GradeId, StudentAccount, StudentStruggleRecord, TeacherAccount, TopicStruggle } from '../types';
import { INITIAL_STUDENTS, INITIAL_TOPICS, MOCK_DOUBT_LOGS } from '../data/mockTeacherData';
import { fetchTeacherInsight } from '../services/apiService';
import { getStudentsForTeacher } from '../services/authService';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Sparkles,
  Lock,
  Download,
  Filter,
  CheckCircle2,
  ArrowRight,
  Printer,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Clock,
  Search,
  MessageSquare,
  Calendar,
  Send,
  UserCheck,
  Check,
  X,
  Share2,
  Copy,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  Volume2,
  Award,
  Zap
} from 'lucide-react';

interface TeacherDashboardViewProps {
  teacher: TeacherAccount;
  onBackToStudent: () => void;
}

const WEEK_LABELS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'];

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ teacher, onBackToStudent }) => {
  // Dashboard Filters — grade is LOCKED to the class this teacher teaches, so a
  // teacher only ever sees and manages their own class's students, never another class.
  const [filterBoard, setFilterBoard] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const filterGrade = teacher.classTaught;
  const [activeKpiFilter, setActiveKpiFilter] = useState<'all' | 'critical' | null>(null);

  // Students who registered themselves under this teacher's class + school
  // (fetched from the server, scoped to the logged-in teacher's own roster)
  const [registeredRoster, setRegisteredRoster] = useState<StudentAccount[]>([]);
  useEffect(() => {
    let cancelled = false;
    getStudentsForTeacher().then((students) => {
      if (!cancelled) setRegisteredRoster(students);
    });
    return () => {
      cancelled = true;
    };
  }, [teacher.teacherCode]);

  // Modals & Panels
  const [selectedStudent, setSelectedStudent] = useState<StudentStruggleRecord | null>(null);
  const [showDoubtsFeedModal, setShowDoubtsFeedModal] = useState(false);
  const [showHelpfulnessModal, setShowHelpfulnessModal] = useState(false);
  const [doubtFeedSearch, setDoubtFeedSearch] = useState('');
  const [doubtFeedSubjectFilter, setDoubtFeedSubjectFilter] = useState('all');

  // Topic Selection & AI Remedial Plan Generator
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [remedialPlan, setRemedialPlan] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [assignedPlanToast, setAssignedPlanToast] = useState(false);

  // Student Connect Action states
  const [connectTab, setConnectTab] = useState<'practice' | 'slot' | 'message' | 'plan'>('practice');
  const [selectedPracticeDiff, setSelectedPracticeDiff] = useState<'Easy' | 'Medium' | 'Challenging'>('Easy');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Tomorrow 4:30 PM (Doubt Clinic)');
  const [teacherCustomMessage, setTeacherCustomMessage] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Filter topics
  const filteredTopics = INITIAL_TOPICS.filter((t) => {
    if (filterBoard !== 'all' && t.board !== filterBoard) return false;
    if (filterSubject !== 'all' && t.subject !== filterSubject) return false;
    if (t.grade !== filterGrade) return false;
    return true;
  });

  // Filter students
  const filteredStudents = INITIAL_STUDENTS.filter((s) => {
    if (filterBoard !== 'all' && s.board !== filterBoard) return false;
    if (filterSubject !== 'all' && s.subject !== filterSubject) return false;
    if (s.grade !== filterGrade) return false;
    if (activeKpiFilter === 'critical' && s.urgency !== 'critical') return false;
    return true;
  });

  // BUGFIX: previously, if no pre-loaded "struggle topics" matched the current
  // filters (e.g. no mock data existed yet for this grade), `activeTopic` was
  // `undefined` and the entire banner — including the "Generate 10-Min
  // Remedial Script" button — silently disappeared with no explanation. That's
  // the "not working" bug. We now always fall back to a synthetic topic built
  // from the teacher's own class/subject/school context, so the button (and
  // the AI generator behind it) is always available.
  const fallbackTopic: TopicStruggle = {
    name: `${filterSubject !== 'all' ? filterSubject : 'General Revision'} — ${filterGrade}`,
    subject: filterSubject !== 'all' ? filterSubject : 'General',
    grade: filterGrade,
    board: (filterBoard !== 'all' ? filterBoard : 'NCERT') as BoardId,
    count: 0,
    trend: [0, 0, 0, 0, 0, 0],
    students: registeredRoster.length,
    subconcepts: ['Foundational concepts for this chapter'],
  };
  const activeTopic = filteredTopics[selectedTopicIdx] || filteredTopics[0] || fallbackTopic;

  // AI Remedial Plan handler
  const handleGenerateRemedialPlan = async () => {
    if (!activeTopic) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await fetchTeacherInsight({
        topicName: activeTopic.name,
        subject: activeTopic.subject,
        grade: activeTopic.grade,
        board: activeTopic.board,
        studentCount: activeTopic.students,
        strugglePoints: activeTopic.subconcepts,
      });
      setRemedialPlan(plan);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleCopyPlan = () => {
    if (!remedialPlan) return;
    navigator.clipboard.writeText(remedialPlan);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  const handleAssignPlanToBatch = () => {
    setAssignedPlanToast(true);
    setTimeout(() => setAssignedPlanToast(false), 3000);
  };

  const triggerStudentToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  // Hand-built SVG chart builder
  const renderTrendSVG = (trend: number[]) => {
    const w = 640;
    const h = 200;
    const padL = 36;
    const padR = 24;
    const padT = 20;
    const padB = 30;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    const maxVal = Math.max(...trend, 5);
    const niceMax = Math.ceil(maxVal / 5) * 5;

    const stepX = chartW / (trend.length - 1);
    const points = trend.map((v, i) => {
      const x = padL + i * stepX;
      const y = padT + chartH - (v / niceMax) * chartH;
      return { x, y, v };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${padT + chartH} L ${points[0].x.toFixed(1)} ${padT + chartH} Z`;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Doubt trend over 6 weeks">
        <defs>
          <linearGradient id="teacherTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5F4E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF5F4E" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="teacherTrendStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF5F4E" />
            <stop offset="100%" stopColor="#FFB937" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 1, 2, 3, 4].map((g) => {
          const gv = Math.round((niceMax / 4) * g);
          const gy = padT + chartH - (gv / niceMax) * chartH;
          return (
            <g key={g}>
              <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke="#E3D6BC" strokeWidth="1" strokeDasharray="3 3" />
              <text x={padL - 8} y={gy + 3} fontSize="10" textAnchor="end" fill="#8A7A5C">
                {gv}
              </text>
            </g>
          );
        })}

        {/* Area & Line */}
        <path d={areaPath} fill="url(#teacherTrendFill)" />
        <path d={linePath} fill="none" stroke="url(#teacherTrendStroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Value labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#FFF6E9" stroke="#FF5F4E" strokeWidth="2.5" />
            <text x={p.x} y={p.y - 9} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1B1330">
              {p.v}
            </text>
            <text x={p.x} y={h - 10} fontSize="11" textAnchor="middle" fill="#8A7A5C">
              {WEEK_LABELS[i]}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Authentication now happens once, at the app level (see AuthView), where the
  // teacher registers/logs in with their Teacher Code + password. This component
  // only ever renders for an already-authenticated teacher, scoped to their class.
  const totalDoubts = filteredTopics.reduce((acc, t) => acc + t.count, 0);
  const criticalCount = filteredStudents.filter((s) => s.urgency === 'critical').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-[#221631] text-[#FFF6E9] p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#FF5F4E]/20 text-[#FFB937]">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="font-display text-xl font-bold text-white">Teacher Hub & Classroom Insight</h1>
          </div>
          <p className="text-xs text-[#D9C9E6] mt-0.5">
            Managing <b className="text-[#FFB937]">{filterGrade}</b> · {teacher.schoolName} ({teacher.schoolType}) — you only see and manage students in your own class.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by Board"
            value={filterBoard}
            onChange={(e) => setFilterBoard(e.target.value)}
            className="text-xs font-semibold bg-white/10 border border-white/20 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all" className="bg-[#221631]">All Boards</option>
            <option value="NCERT" className="bg-[#221631]">NCERT</option>
            <option value="TSCERT" className="bg-[#221631]">TSCERT</option>
          </select>

          <select
            aria-label="Filter by Subject"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-xs font-semibold bg-white/10 border border-white/20 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all" className="bg-[#221631]">All Subjects</option>
            <option value="Mathematics" className="bg-[#221631]">Mathematics</option>
            <option value="Science" className="bg-[#221631]">Science</option>
            <option value="Physical Science" className="bg-[#221631]">Physical Science</option>
            <option value="Biological Science" className="bg-[#221631]">Biological Science</option>
          </select>

          <span
            title="Locked to the class you registered as teaching"
            className="text-xs font-bold bg-white/10 border border-white/20 text-[#FFB937] rounded-lg px-2.5 py-1.5 flex items-center gap-1"
          >
            <Lock className="w-3 h-3" /> {filterGrade}
          </span>

          <button
            type="button"
            onClick={onBackToStudent}
            className="text-xs font-bold text-[#FF5F4E] hover:underline px-2 py-1"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Registered Students Roster (real accounts registered under this class + school) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-[#E3D6BC] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-sm text-[#1B1330] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#2E8B6F]" />
            Registered Students in {filterGrade} · {teacher.schoolName}
          </h3>
          <span className="text-[11px] font-bold text-[#8A7A5C]">{registeredRoster.length} registered</span>
        </div>
        {registeredRoster.length === 0 ? (
          <p className="text-xs text-[#8A7A5C]">
            No students have registered under {filterGrade} at {teacher.schoolName} yet. Once students sign up with the same
            school name and class, they'll appear here automatically.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {registeredRoster.map((s) => (
              <span
                key={s.username}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3ECDD] text-[#5A4E38] border border-[#E3D6BC]"
              >
                {s.username} · {s.place}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Toast */}
      {actionSuccessToast && (
        <div className="bg-[#2E8B6F] text-white p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccessToast}</span>
          </div>
          <button type="button" onClick={() => setActionSuccessToast(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Row - ALL 4 INTERACTIVE & CLICKABLE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Doubts Logged */}
        <button
          type="button"
          onClick={() => setShowDoubtsFeedModal(true)}
          className="text-left bg-white p-5 rounded-2xl border-2 border-[#E3D6BC] hover:border-[#FF5F4E] shadow-sm transition hover:shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-[#8A7A5C] uppercase tracking-wider">Total Doubts Logged</div>
            <ExternalLink className="w-3.5 h-3.5 text-[#8A7A5C] group-hover:text-[#FF5F4E] transition" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#1B1330] mt-1">{totalDoubts}</div>
          <div className="text-[11px] text-[#2E8B6F] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Click to view doubts feed & students →
          </div>
        </button>

        {/* KPI 2: Students Under Observation */}
        <button
          type="button"
          onClick={() => setActiveKpiFilter(null)}
          className={`text-left bg-white p-5 rounded-2xl border-2 transition shadow-sm hover:shadow-md cursor-pointer ${
            activeKpiFilter === null ? 'border-[#1B1330] ring-2 ring-[#1B1330]/20' : 'border-[#E3D6BC] hover:border-[#1B1330]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-[#8A7A5C] uppercase tracking-wider">Students Under Observation</div>
            <Users className="w-3.5 h-3.5 text-[#8A7A5C]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#1B1330] mt-1">{filteredStudents.length}</div>
          <div className="text-[11px] text-[#8A7A5C] mt-1">
            {activeKpiFilter === null ? `✓ Showing your ${filterGrade} cohort` : 'Click to show all students'}
          </div>
        </button>

        {/* KPI 3: Critical Priority Flags */}
        <button
          type="button"
          onClick={() => setActiveKpiFilter((prev) => (prev === 'critical' ? null : 'critical'))}
          className={`text-left bg-white p-5 rounded-2xl border-2 transition shadow-sm hover:shadow-md cursor-pointer ${
            activeKpiFilter === 'critical'
              ? 'border-[#FF5F4E] bg-[#FFF6F4] ring-2 ring-[#FF5F4E]/30'
              : 'border-[#E3D6BC] hover:border-[#FF5F4E]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-[#FF5F4E] uppercase tracking-wider">Critical Priority Flags</div>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF5F4E]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#FF5F4E] mt-1">{criticalCount}</div>
          <div className="text-[11px] font-semibold text-[#FF5F4E] mt-1">
            {activeKpiFilter === 'critical' ? '⚡ Filter active (Click to reset)' : 'Click to filter critical students →'}
          </div>
        </button>

        {/* KPI 4: Avg Doubt Helpfulness */}
        <button
          type="button"
          onClick={() => setShowHelpfulnessModal(true)}
          className="text-left bg-white p-5 rounded-2xl border-2 border-[#E3D6BC] hover:border-[#2E8B6F] shadow-sm transition hover:shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-[#8A7A5C] uppercase tracking-wider">Avg Doubt Helpfulness</div>
            <ExternalLink className="w-3.5 h-3.5 text-[#8A7A5C] group-hover:text-[#2E8B6F] transition" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#2E8B6F] mt-1">84%</div>
          <div className="text-[11px] text-[#2E8B6F] font-semibold mt-1">
            Click to view rating analytics & weak spots →
          </div>
        </button>
      </div>

      {/* Active Filter Pill */}
      {activeKpiFilter === 'critical' && (
        <div className="bg-[#FFF6F4] border border-[#FF5F4E] p-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#FF5F4E] font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Filtering strictly: Students with Critical Priority flags (5+ repeat confusion signals)</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveKpiFilter(null)}
            className="text-xs font-bold bg-[#FF5F4E] text-white px-3 py-1 rounded-lg hover:bg-[#FF5F4E]/90"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* AI Teacher Assistant Recommendation Banner */}
      {activeTopic && (
        <div className="bg-gradient-to-r from-[#2A1B3A] to-[#221631] text-[#FFF6E9] rounded-3xl p-6 shadow-lg border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] uppercase font-bold text-[#FFB937] tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB937]" />
              AI Pedagogical Diagnosis for this week
            </div>
            <div className="font-display text-lg font-bold text-white">
              <b>{activeTopic.students} students</b> are struggling with <b>{activeTopic.name}</b>
            </div>
            <p className="text-xs text-[#D9C9E6]">
              Subconcepts causing confusion: {activeTopic.subconcepts.join(', ')}.
            </p>
          </div>

          <button
            id="generate-remedial-plan-btn"
            type="button"
            disabled={isGeneratingPlan}
            onClick={handleGenerateRemedialPlan}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF5F4E] to-[#FFB937] text-[#1B1330] font-display font-bold text-xs sm:text-sm flex items-center gap-2 hover:shadow-lg transition active:scale-95 whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingPlan ? 'Generating 10-Min Script…' : 'Generate 10-Min Remedial Script'}</span>
          </button>
        </div>
      )}

      {/* Assigned Plan Toast */}
      {assignedPlanToast && (
        <div className="bg-[#1B1330] text-[#FFB937] p-4 rounded-2xl text-xs font-bold flex items-center justify-between border border-[#FFB937]/30 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E8B6F]" />
            <span>10-Minute Remedial Lesson & 3-Problem Worksheet assigned to {activeTopic?.students || 'all'} struggling students!</span>
          </div>
          <button type="button" onClick={() => setAssignedPlanToast(false)} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Remedial Plan Display Modal/Section */}
      {remedialPlan && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFB937] shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E3D6BC] pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FFB937]/20 text-[#8A7A5C]">
                <BookOpen className="w-5 h-5 text-[#FF5F4E]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-[#1B1330]">
                  10-Minute Remedial Lesson Script & Scaffolded Worksheet
                </h2>
                <div className="text-xs text-[#8A7A5C]">
                  Topic: <b>{activeTopic?.name}</b> · {activeTopic?.board} · {activeTopic?.grade}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPlan}
                className="px-3 py-1.5 rounded-xl border border-[#E3D6BC] hover:bg-[#FFF6E9] text-xs font-bold text-[#1B1330] flex items-center gap-1"
              >
                {copiedPlan ? <Check className="w-3.5 h-3.5 text-[#2E8B6F]" /> : <Copy className="w-3.5 h-3.5 text-[#8A7A5C]" />}
                <span>{copiedPlan ? 'Copied!' : 'Copy Script'}</span>
              </button>

              <button
                type="button"
                onClick={handleAssignPlanToBatch}
                className="px-3 py-1.5 rounded-xl bg-[#1B1330] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#221631]"
              >
                <Send className="w-3.5 h-3.5 text-[#FFB937]" />
                <span>Assign to Batch</span>
              </button>

              <button
                type="button"
                onClick={() => setRemedialPlan(null)}
                className="text-xs font-bold text-[#8A7A5C] hover:text-[#1B1330] px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-[#4A3F30] leading-relaxed whitespace-pre-wrap bg-[#FFF6E9]/40 p-6 rounded-2xl border border-[#E3D6BC] font-sans">
            {remedialPlan}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#8A7A5C]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5F4E]" />
              <span>Grounded in actual student confusion signals from your classroom.</span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-[#E3D6BC] hover:bg-[#FFF6E9] text-[#1B1330] text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Worksheet</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Struggling Students vs Topic Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Students who need attention (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3D6BC] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E3D6BC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5F4E]" />
              <h2 className="font-display font-bold text-base text-[#1B1330]">
                Students Needing Direct Attention
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F3ECDD] text-[#5A4E38]">
              {filteredStudents.length} students
            </span>
          </div>

          <div className="divide-y divide-[#E3D6BC] overflow-y-auto max-h-[580px]">
            {filteredStudents.map((std) => (
              <div
                key={std.id}
                className={`p-4 sm:p-5 transition-all flex flex-col gap-3 ${
                  std.urgency === 'critical'
                    ? 'border-l-4 border-l-[#FF5F4E] bg-[#FFF6F4]/50'
                    : std.urgency === 'elevated'
                    ? 'border-l-4 border-l-[#FFB937] bg-[#FFFBF1]/50'
                    : 'border-l-4 border-l-[#E3D6BC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1B1330] text-white font-display font-bold text-xs flex items-center justify-center shadow-sm">
                      {std.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1B1330] flex items-center gap-2">
                        <span>{std.name}</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white border border-[#E3D6BC] text-[#8A7A5C]">
                          {std.helpfulPercentage}% satisfaction
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8A7A5C]">
                        {std.board} · {std.subject} · {std.grade}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        std.urgency === 'critical'
                          ? 'bg-[#FF5F4E] text-white'
                          : std.urgency === 'elevated'
                          ? 'bg-[#FFB937] text-[#1B1330]'
                          : 'bg-[#EADFC9] text-[#8A7A5C]'
                      }`}
                    >
                      {std.urgency}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedStudent(std)}
                      className="px-3 py-1.5 rounded-xl bg-[#1B1330] text-white text-xs font-bold hover:bg-[#FF5F4E] transition flex items-center gap-1 shadow-sm"
                    >
                      <span>View Profile & Connect</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Struggling topics pills */}
                <div className="flex flex-wrap gap-1.5">
                  {std.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-[#F3ECDD] border border-[#E3D6BC] px-2 py-0.5 rounded-md text-[#5A4E38]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Suggested Action Item */}
                <div className="bg-white p-3 rounded-xl border border-[#E3D6BC] text-xs text-[#5A4E38] flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5F4E] flex-shrink-0 mt-0.5" />
                  <div>
                    <b>Suggested Action:</b> {std.suggestedIntervention}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8A7A5C] pt-1">
                  <span>⚠️ {std.signals} repeated confusion signals</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Active {std.lastActive}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Topic Difficulty & Trend Graph (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Topic List */}
          <div className="bg-white rounded-3xl border border-[#E3D6BC] shadow-sm p-5 space-y-4">
            <h2 className="font-display font-bold text-base text-[#1B1330] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF5F4E]" />
              Most Struggled Topics
            </h2>

            <div className="space-y-2">
              {filteredTopics.map((topic, idx) => {
                const isSelected = selectedTopicIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTopicIdx(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5F4E] bg-[#FFF6F4] shadow-sm'
                        : 'border-[#E3D6BC] hover:border-[#FF5F4E] bg-[#FFF6E9]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1B1330]">{topic.name}</span>
                      <span className="font-display font-bold text-xs text-[#FF5F4E] bg-[#FF5F4E]/10 px-2 py-0.5 rounded-full">
                        {topic.count} doubts
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8A7A5C] mt-1">
                      {topic.board} · {topic.subject} · {topic.grade} ({topic.students} students affected)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6-Week Doubt Trend Chart */}
          {activeTopic && (
            <div className="bg-white rounded-3xl border border-[#E3D6BC] shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#8A7A5C]">
                  6-Week Struggle Volume Trend
                </h3>
                <span className="text-[11px] font-bold text-[#FF5F4E] truncate max-w-[150px]">
                  {activeTopic.name.split('—')[0]}
                </span>
              </div>

              {renderTrendSVG(activeTopic.trend)}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: STUDENT PROFILE & DIRECT CONNECT TOOLKIT
         ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF6E9] w-full max-w-2xl rounded-3xl border-2 border-[#E3D6BC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Header */}
            <div className="bg-[#221631] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5F4E] to-[#FFB937] text-[#1B1330] font-display font-bold text-base flex items-center justify-center shadow">
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    {selectedStudent.name}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        selectedStudent.urgency === 'critical'
                          ? 'bg-[#FF5F4E] text-white'
                          : 'bg-[#FFB937] text-[#1B1330]'
                      }`}
                    >
                      {selectedStudent.urgency} Priority
                    </span>
                  </h3>
                  <div className="text-xs text-[#D9C9E6]">
                    {selectedStudent.board} · {selectedStudent.grade} · {selectedStudent.subject} (Last active: {selectedStudent.lastActive})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Quick stats banner */}
              <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#E3D6BC] text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8A7A5C]">Confusion Signals</div>
                  <div className="font-display text-xl font-bold text-[#FF5F4E]">{selectedStudent.signals} Flags</div>
                </div>
                <div className="border-x border-[#E3D6BC]">
                  <div className="text-[10px] uppercase font-bold text-[#8A7A5C]">AI Helpfulness</div>
                  <div className="font-display text-xl font-bold text-[#2E8B6F]">{selectedStudent.helpfulPercentage}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8A7A5C]">Weak Topics</div>
                  <div className="font-display text-xl font-bold text-[#1B1330]">{selectedStudent.topics.length}</div>
                </div>
              </div>

              {/* Weak Topics */}
              <div>
                <h4 className="text-xs uppercase font-bold text-[#8A7A5C] tracking-wider mb-1.5">
                  Specific Learning Gaps:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold bg-[#FF5F4E]/10 border border-[#FF5F4E]/30 text-[#FF5F4E] px-3 py-1 rounded-xl"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent doubts asked by this student */}
              <div>
                <h4 className="text-xs uppercase font-bold text-[#8A7A5C] tracking-wider mb-1.5">
                  Recent Doubts Asked By Student:
                </h4>
                <div className="space-y-2">
                  {selectedStudent.recentDoubts.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#E3D6BC] text-xs text-[#1B1330] flex items-start gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#FF5F4E] flex-shrink-0 mt-0.5" />
                      <span>"{d}"</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIRECT CONNECT & INTERVENTION TABS */}
              <div className="bg-white p-5 rounded-2xl border-2 border-[#1B1330] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3D6BC] pb-3">
                  <div className="font-display font-bold text-sm text-[#1B1330] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#FF5F4E]" />
                    <span>Direct Teacher Action & Connection</span>
                  </div>

                  <div className="flex gap-1">
                    {[
                      { id: 'practice', label: 'Assign Drill' },
                      { id: 'slot', label: '1-on-1 Slot' },
                      { id: 'message', label: 'Send Note' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setConnectTab(tab.id as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                          connectTab === tab.id
                            ? 'bg-[#1B1330] text-white'
                            : 'bg-[#FFF6E9] text-[#8A7A5C] hover:text-[#1B1330]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab 1: Assign Practice */}
                {connectTab === 'practice' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#5A4E38]">
                      Assign an adaptive practice drill on <b>{selectedStudent.topics[0]}</b> directly to {selectedStudent.name}'s account:
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1B1330]">Difficulty:</span>
                      {(['Easy', 'Medium', 'Challenging'] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setSelectedPracticeDiff(diff)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                            selectedPracticeDiff === diff
                              ? 'bg-[#FF5F4E] text-white border-[#FF5F4E]'
                              : 'bg-white text-[#8A7A5C] border-[#E3D6BC]'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerStudentToast(`Assigned ${selectedPracticeDiff} practice drill on "${selectedStudent.topics[0]}" to ${selectedStudent.name}!`);
                        setSelectedStudent(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#2E8B6F] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#2E8B6F]/90 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Practice Drill Link to {selectedStudent.name}</span>
                    </button>
                  </div>
                )}

                {/* Tab 2: Schedule 1-on-1 Slot */}
                {connectTab === 'slot' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#5A4E38]">
                      Reserve a 10-minute teacher assistance slot to explain weak formulas:
                    </p>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E3D6BC] text-xs font-semibold text-[#1B1330] bg-white focus:outline-none"
                    >
                      <option value="Tomorrow 4:30 PM (Doubt Clinic)">Tomorrow 4:30 PM (Doubt Clinic)</option>
                      <option value="Friday 8:30 AM (Zero Period)">Friday 8:30 AM (Zero Period)</option>
                      <option value="Saturday 11:00 AM (Weekend Support)">Saturday 11:00 AM (Weekend Support)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        triggerStudentToast(`Scheduled 1-on-1 doubt clearing session with ${selectedStudent.name} for ${selectedTimeSlot}!`);
                        setSelectedStudent(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#1B1330] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#221631]"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#FFB937]" />
                      <span>Confirm & Notify {selectedStudent.name}</span>
                    </button>
                  </div>
                )}

                {/* Tab 3: Send Note */}
                {connectTab === 'message' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#5A4E38]">
                      Send an encouraging teacher note or voice note prompt:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Don't worry about quadratic signs, let's practice 2 examples tomorrow!",
                        "Great effort on chemical balancing! Review the color-coded table I shared.",
                        "Please bring your doubt notebook during tomorrow's zero period."
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTeacherCustomMessage(preset)}
                          className="text-[10px] bg-[#FFF6E9] hover:bg-[#EADFC9] border border-[#E3D6BC] p-1.5 rounded-lg text-left text-[#5A4E38]"
                        >
                          "{preset}"
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={teacherCustomMessage}
                      onChange={(e) => setTeacherCustomMessage(e.target.value)}
                      placeholder={`Write a personal message to ${selectedStudent.name}…`}
                      className="w-full p-2.5 rounded-xl border border-[#E3D6BC] text-xs text-[#1B1330] focus:outline-none focus:border-[#FF5F4E]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerStudentToast(`Teacher encouragement note sent to ${selectedStudent.name}!`);
                        setSelectedStudent(null);
                        setTeacherCustomMessage('');
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#FF5F4E] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FF5F4E]/90"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Direct Notification</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TOTAL DOUBTS AUDIT FEED
         ========================================================================= */}
      {showDoubtsFeedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF6E9] w-full max-w-3xl rounded-3xl border-2 border-[#E3D6BC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            <div className="bg-[#221631] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#FFB937]" />
                  <span>Real-Time Logged Doubts Activity Feed</span>
                </h3>
                <p className="text-xs text-[#D9C9E6]">
                  Inspect what questions students are posting, which subjects need attention, and who asked them.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDoubtsFeedModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Search & Subject filter bar */}
            <div className="p-4 bg-white border-b border-[#E3D6BC] flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A7A5C]" />
                <input
                  type="text"
                  value={doubtFeedSearch}
                  onChange={(e) => setDoubtFeedSearch(e.target.value)}
                  placeholder="Search doubts or student name…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E3D6BC] text-xs font-semibold text-[#1B1330] focus:outline-none focus:border-[#FF5F4E]"
                />
              </div>

              <select
                value={doubtFeedSubjectFilter}
                onChange={(e) => setDoubtFeedSubjectFilter(e.target.value)}
                className="text-xs font-semibold p-2 rounded-xl border border-[#E3D6BC] bg-[#FFF6E9] text-[#1B1330]"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physical Science">Physical Science</option>
                <option value="Biological Science">Biological Science</option>
                <option value="Science">Science</option>
              </select>
            </div>

            {/* List */}
            <div className="p-5 overflow-y-auto space-y-3">
              {MOCK_DOUBT_LOGS.filter((log) => {
                if (doubtFeedSubjectFilter !== 'all' && log.subject !== doubtFeedSubjectFilter) return false;
                if (
                  doubtFeedSearch.trim() &&
                  !log.question.toLowerCase().includes(doubtFeedSearch.toLowerCase()) &&
                  !log.studentName.toLowerCase().includes(doubtFeedSearch.toLowerCase()) &&
                  !log.topic.toLowerCase().includes(doubtFeedSearch.toLowerCase())
                )
                  return false;
                return true;
              }).map((log) => (
                <div
                  key={log.id}
                  className="bg-white p-4 rounded-2xl border border-[#E3D6BC] shadow-sm space-y-2 hover:border-[#FF5F4E] transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1B1330]">{log.studentName}</span>
                      <span className="text-[11px] text-[#8A7A5C]">({log.grade} · {log.board})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#F3ECDD] text-[#5A4E38] text-[10px] font-bold">
                        {log.subject}
                      </span>
                      <span className="text-[11px] text-[#8A7A5C] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {log.time}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#1B1330] font-medium leading-snug">
                    "{log.question}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F0E6D2]">
                    <span className="text-[#8A7A5C]">
                      Language: <b>{log.language}</b> · Topic: <b>{log.topic}</b>
                    </span>
                    <span
                      className={`font-bold ${
                        log.helpful ? 'text-[#2E8B6F]' : 'text-[#FF5F4E]'
                      }`}
                    >
                      {log.helpful ? '✓ Marked Helpful' : '⚠️ Needed Simplification'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DOUBT SATISFACTION & HELPFULNESS ANALYTICS
         ========================================================================= */}
      {showHelpfulnessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF6E9] w-full max-w-2xl rounded-3xl border-2 border-[#E3D6BC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            <div className="bg-[#221631] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#2E8B6F]" />
                  <span>Doubt Resolution Satisfaction Analytics</span>
                </h3>
                <p className="text-xs text-[#D9C9E6]">
                  Breakdown of AI tutor explanation ratings by subject and identified student weak spots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpfulnessModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Satisfaction bars */}
              <div className="bg-white p-5 rounded-2xl border border-[#E3D6BC] space-y-3">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#8A7A5C]">
                  Helpfulness Rate by Subject:
                </h4>

                {[
                  { subject: 'Biological Science (TSCERT Class 10)', rate: 92, color: 'bg-[#2E8B6F]' },
                  { subject: 'Science (NCERT Class 9)', rate: 88, color: 'bg-[#2E8B6F]' },
                  { subject: 'Physical Science (TSCERT Class 10)', rate: 81, color: 'bg-[#FFB937]' },
                  { subject: 'Mathematics (NCERT & TSCERT Class 10)', rate: 74, color: 'bg-[#FF5F4E]' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1B1330]">
                      <span>{item.subject}</span>
                      <span>{item.rate}% satisfied</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EADFC9] rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Students with lowest satisfaction ratings who need intervention */}
              <div className="bg-white p-5 rounded-2xl border border-[#E3D6BC] space-y-3">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#FF5F4E]">
                  Students Reporting Low Helpfulness (Immediate Intervention Needed):
                </h4>
                <div className="divide-y divide-[#E3D6BC]">
                  {filteredStudents.filter((s) => s.helpfulPercentage < 40).map((std) => (
                    <div key={std.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1B1330]">{std.name}</span>
                        <span className="text-[#8A7A5C]"> ({std.subject})</span>
                        <div className="text-[11px] text-[#FF5F4E]">Only {std.helpfulPercentage}% doubts resolved</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowHelpfulnessModal(false);
                          setSelectedStudent(std);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#1B1330] text-white text-[11px] font-bold hover:bg-[#FF5F4E]"
                      >
                        Connect Now →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
