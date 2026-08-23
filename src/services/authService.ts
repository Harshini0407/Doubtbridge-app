import { GradeId, Gender, SchoolType, SessionUser, StudentAccount, TeacherAccount } from '../types';

// ==========================================
// REAL BACKEND AUTH (client)
// ==========================================
// Accounts and passwords live server-side (SQLite + bcrypt, see
// src/server/authRoutes.ts). The session is a signed JWT in an httpOnly
// cookie, so this file never sees or stores a password or token directly —
// it just calls the API and lets the browser carry the cookie.

export interface AuthResult<T> {
  success: boolean;
  error?: string;
  account?: T;
}

async function postJson<T>(url: string, body: unknown): Promise<AuthResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error || 'Something went wrong. Please try again.' };
    }
    return { success: true, account: data.account as T };
  } catch {
    return { success: false, error: 'Could not reach the server. Please check your connection and try again.' };
  }
}

// ---------- Students ----------

export function registerStudent(input: {
  username: string;
  password: string;
  schoolType: SchoolType;
  schoolName: string;
  gender: Gender;
  grade: GradeId;
  place: string;
}): Promise<AuthResult<StudentAccount>> {
  return postJson<StudentAccount>('/api/auth/student/register', input);
}

export function loginStudent(username: string, password: string): Promise<AuthResult<StudentAccount>> {
  return postJson<StudentAccount>('/api/auth/student/login', { username, password });
}

// ---------- Teachers ----------

export function registerTeacher(input: {
  teacherCode: string;
  password: string;
  schoolName: string;
  classTaught: GradeId;
  schoolType: SchoolType;
}): Promise<AuthResult<TeacherAccount>> {
  return postJson<TeacherAccount>('/api/auth/teacher/register', input);
}

export function loginTeacher(teacherCode: string, password: string): Promise<AuthResult<TeacherAccount>> {
  return postJson<TeacherAccount>('/api/auth/teacher/login', { teacherCode, password });
}

// ---------- Roster: students that belong to the logged-in teacher's class ----------

export async function getStudentsForTeacher(): Promise<StudentAccount[]> {
  try {
    const res = await fetch('/api/auth/teacher/roster', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({ students: [] }));
    return (data.students as StudentAccount[]) || [];
  } catch {
    return [];
  }
}

// ---------- Session ----------

export async function getSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({ session: null }));
    return (data.session as SessionUser) || null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // Best-effort — even if this fails, the caller clears local UI state.
  }
}
