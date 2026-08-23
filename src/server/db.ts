import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uses Node's built-in SQLite module (available Node 22.5+, no native
// compilation / build tools required — unlike better-sqlite3, which needs a
// C++ toolchain and breaks on machines without one, especially on Windows).
//
// SQLite file lives outside src/ so it isn't wiped by a rebuild and isn't
// bundled into the client. DB_PATH can override this in production
// (e.g. point it at a persistent volume/disk on your host).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'doubtbridge.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,           -- normalized (lowercased/trimmed) username, used for lookups
    username TEXT NOT NULL,        -- original casing, for display
    password_hash TEXT NOT NULL,
    school_type TEXT NOT NULL,
    school_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    grade TEXT NOT NULL,
    place TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,           -- normalized teacher code
    teacher_code TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    school_name TEXT NOT NULL,
    class_taught TEXT NOT NULL,
    school_type TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);
