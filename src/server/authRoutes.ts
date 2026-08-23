import express, { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

// ==========================================
// REAL BACKEND AUTH
// ==========================================
// Passwords are hashed with bcrypt (10 salt rounds) and never touch the
// client. Sessions are signed JWTs stored in an httpOnly cookie, so
// client-side JS (and any XSS payload) can never read the token.

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Fail loudly rather than silently signing tokens with a guessable
  // default — an unset secret in production would let anyone forge sessions.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production. Add it to your environment / secrets.');
  }
  console.warn('⚠️  JWT_SECRET not set — using an insecure dev-only fallback. Set JWT_SECRET before deploying.');
}
const SECRET = JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production';
const COOKIE_NAME = 'db_session';
const SALT_ROUNDS = 10;

type Role = 'student' | 'teacher';

interface StudentRow {
  id: string;
  username: string;
  password_hash: string;
  school_type: string;
  school_name: string;
  gender: string;
  grade: string;
  place: string;
  created_at: string;
}

interface TeacherRow {
  id: string;
  teacher_code: string;
  password_hash: string;
  school_name: string;
  class_taught: string;
  school_type: string;
  created_at: string;
}

function normalizeId(id: string): string {
  return id.trim().toLowerCase();
}

function studentPublic(row: StudentRow) {
  return {
    username: row.username,
    schoolType: row.school_type,
    schoolName: row.school_name,
    gender: row.gender,
    grade: row.grade,
    place: row.place,
    createdAt: row.created_at,
  };
}

function teacherPublic(row: TeacherRow) {
  return {
    teacherCode: row.teacher_code,
    schoolName: row.school_name,
    classTaught: row.class_taught,
    schoolType: row.school_type,
    createdAt: row.created_at,
  };
}

function signSession(role: Role, id: string): string {
  return jwt.sign({ role, id }, SECRET, { expiresIn: '30d' });
}

function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
}

// Attaches req.session = { role, id } if a valid cookie is present.
function readSession(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET) as { role: Role; id: string };
      (req as any).session = payload;
    } catch {
      // Expired/invalid token — treat as logged out rather than erroring.
    }
  }
  next();
}

function requireAuth(role?: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = (req as any).session as { role: Role; id: string } | undefined;
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (role && session.role !== role) {
      return res.status(403).json({ error: 'Not authorized for this resource.' });
    }
    next();
  };
}

export function registerAuthRoutes(app: express.Express) {
  app.use(readSession);

  const router = Router();

  // ---------- Student registration / login ----------

  router.post('/student/register', async (req, res) => {
    const { username, password, schoolType, schoolName, gender, grade, place } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || password.length < 4) {
      return res.status(400).json({ error: 'Username is required and password must be at least 4 characters.' });
    }
    if (!schoolName || !schoolType || !gender || !grade || !place) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    const id = normalizeId(username);
    const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(id);
    if (existing) {
      return res.status(409).json({ error: 'That username is already registered. Please log in instead.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO students (id, username, password_hash, school_type, school_name, gender, grade, place, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, String(username).trim(), passwordHash, schoolType, String(schoolName).trim(), gender, grade, String(place).trim(), createdAt);

    const token = signSession('student', id);
    setSessionCookie(res, token);
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as unknown as StudentRow;
    res.json({ success: true, account: studentPublic(row) });
  });

  router.post('/student/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Incorrect username or password.' });
    }
    const id = normalizeId(username);
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as unknown as StudentRow | undefined;
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }
    const token = signSession('student', id);
    setSessionCookie(res, token);
    res.json({ success: true, account: studentPublic(row) });
  });

  // ---------- Teacher registration / login ----------

  router.post('/teacher/register', async (req, res) => {
    const { teacherCode, password, schoolName, classTaught, schoolType } = req.body || {};
    if (typeof teacherCode !== 'string' || typeof password !== 'string' || !teacherCode.trim() || password.length < 4) {
      return res.status(400).json({ error: 'Teacher code is required and password must be at least 4 characters.' });
    }
    if (!schoolName || !classTaught || !schoolType) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    const id = normalizeId(teacherCode);
    const existing = db.prepare('SELECT id FROM teachers WHERE id = ?').get(id);
    if (existing) {
      return res.status(409).json({ error: 'That teacher code is already registered. Please log in instead.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO teachers (id, teacher_code, password_hash, school_name, class_taught, school_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, String(teacherCode).trim(), passwordHash, String(schoolName).trim(), classTaught, schoolType, createdAt);

    const token = signSession('teacher', id);
    setSessionCookie(res, token);
    const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id) as unknown as TeacherRow;
    res.json({ success: true, account: teacherPublic(row) });
  });

  router.post('/teacher/login', async (req, res) => {
    const { teacherCode, password } = req.body || {};
    if (typeof teacherCode !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Incorrect teacher code or password.' });
    }
    const id = normalizeId(teacherCode);
    const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id) as unknown as TeacherRow | undefined;
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: 'Incorrect teacher code or password.' });
    }
    const token = signSession('teacher', id);
    setSessionCookie(res, token);
    res.json({ success: true, account: teacherPublic(row) });
  });

  // ---------- Session ----------

  router.get('/me', (req, res) => {
    const session = (req as any).session as { role: Role; id: string } | undefined;
    if (!session) {
      return res.json({ session: null });
    }
    if (session.role === 'student') {
      const row = db.prepare('SELECT * FROM students WHERE id = ?').get(session.id) as unknown as StudentRow | undefined;
      if (!row) return res.json({ session: null });
      return res.json({ session: { role: 'student', account: studentPublic(row) } });
    } else {
      const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(session.id) as unknown as TeacherRow | undefined;
      if (!row) return res.json({ session: null });
      return res.json({ session: { role: 'teacher', account: teacherPublic(row) } });
    }
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ success: true });
  });

  // ---------- Roster: students registered under the logged-in teacher's class + school ----------

  router.get('/teacher/roster', requireAuth('teacher'), (req, res) => {
    const session = (req as any).session as { role: Role; id: string };
    const teacherRow = db.prepare('SELECT * FROM teachers WHERE id = ?').get(session.id) as unknown as TeacherRow | undefined;
    if (!teacherRow) return res.status(404).json({ error: 'Teacher not found.' });

    const rows = db
      .prepare('SELECT * FROM students WHERE grade = ? AND LOWER(TRIM(school_name)) = LOWER(TRIM(?))')
      .all(teacherRow.class_taught, teacherRow.school_name) as unknown as StudentRow[];

    res.json({ students: rows.map(studentPublic) });
  });

  app.use('/api/auth', router);
}
