export type BoardId = 'NCERT' | 'TSCERT' | 'STATE_BOARDS';
export type GradeId = 'Class 5' | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10';
export type LanguageCode = 'en' | 'hi' | 'te';
export type SchoolType = 'Government' | 'Private' | 'Aided';
export type Gender = 'Male' | 'Female' | 'Other';

// ==========================================
// AUTH / ACCOUNTS
// ==========================================

export interface StudentAccount {
  username: string;
  passwordHash: string;
  schoolType: SchoolType;
  schoolName: string;
  gender: Gender;
  grade: GradeId;
  place: string;
  createdAt: string;
}

export interface TeacherAccount {
  teacherCode: string;
  passwordHash: string;
  schoolName: string;
  classTaught: GradeId;
  schoolType: SchoolType;
  createdAt: string;
}

export type SessionUser =
  | { role: 'student'; account: StudentAccount }
  | { role: 'teacher'; account: TeacherAccount };

export interface SubjectOption {
  id: string;
  name: string;
  board: BoardId;
  grades: GradeId[];
  iconName: string;
  description: string;
}

export interface TextbookCitation {
  textbook: string;
  chapter: string;
  section: string;
  page?: string | number;
}

export interface KnowledgeChunk {
  id: string;
  board: BoardId;
  subject: string;
  grade: GradeId;
  textbook: string;
  chapter: string;
  section: string;
  keywords: string[];
  content: string;
  keyFormulas?: string[];
  summaryPoints?: string[];
  /** One or two sentences in everyday language, no jargon — shown first, before the detailed textbook content. */
  simpleExplanation?: string;
  /** A short relatable real-life example or worked mini-example illustrating the concept. */
  example?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citation?: TextbookCitation;
  language?: LanguageCode;
  helpful?: boolean | null;
  notFound?: boolean;
  error?: boolean;
  suggestedQuestions?: string[];
  formulaList?: string[];
  imageUrl?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  subject: string;
  grade: GradeId;
  chapter: string;
  userSelectedIndex?: number | null;
  isAnswered?: boolean;
}

export interface StudentStruggleRecord {
  id: string;
  name: string;
  board: BoardId;
  subject: string;
  grade: GradeId;
  urgency: 'critical' | 'elevated' | 'watch';
  signals: number;
  topics: string[];
  lastActive: string;
  helpfulPercentage: number;
  recentDoubts: string[];
  suggestedIntervention: string;
}

export interface TopicStruggle {
  name: string;
  subject: string;
  grade: GradeId;
  board: BoardId;
  count: number;
  trend: number[];
  students: number;
  subconcepts: string[];
}

export interface ScholarshipItem {
  id: string;
  title: string;
  provider: string;
  grantAmount: string;
  eligibility: string;
  grades: GradeId[];
  targetAudience: string;
  deadline: string;
  link: string;
  state: 'All India' | 'Telangana' | 'National';
  benefits: string[];
  documentsRequired: string[];
}

export interface InteractionLogEntry {
  id: string;
  studentId: string;
  board: BoardId;
  subject: string;
  grade: GradeId;
  topic: string;
  question: string;
  language: LanguageCode;
  timestamp: string;
  helpful: boolean | null;
}
