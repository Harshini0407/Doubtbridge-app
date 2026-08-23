# DoubtBridge

DoubtBridge is a curriculum-grounded AI tutoring web app for Indian secondary school students (Class 5–10, NCERT / TSCERT / State Boards). It has two kinds of users — **Students** and **Teachers** — each with their own dashboard, and a real (not mocked) authentication system backed by SQLite.

This document explains **how the app actually flows**, screen by screen, so anyone opening the codebase can understand what happens and where.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Tailwind CSS |
| Backend | Express (Node.js), served via `server.ts` |
| Auth | bcrypt password hashing + signed JWT stored in an **httpOnly cookie** |
| Database | SQLite (Node's built-in `node:sqlite`) |
| AI | Google Gemini (`@google/genai`), with automatic model fallback and a curriculum-based fallback if the AI is unavailable |
| Dev server | Vite (middleware mode, attached to the same Express server) |

---

## 1.1 Supported Classes, Boards & Languages

These are the curriculum options a student/teacher can pick from (defined in `src/types.ts`):

**Classes / Grades — 6 total**
| # | Grade |
|---|---|
| 1 | Class 5 |
| 2 | Class 6 |
| 3 | Class 7 |
| 4 | Class 8 |
| 5 | Class 9 |
| 6 | Class 10 |

**Boards**
- NCERT
- TSCERT
- State Boards

**Response Languages**
- English
- Hindi (हिंदी)
- Telugu (తెలుగు)

A student registers with a fixed grade (their own class); a teacher registers with the single grade they teach (`classTaught`). Board, Subject, and Language are chosen per-session in `SelectorView`.

---

## 2. High-Level Flow

```
                     ┌────────────────────┐
                     │   App loads (/)     │
                     └─────────┬───────────┘
                               │
                     GET /api/auth/me
                   (checks httpOnly cookie)
                               │
                 ┌─────────────┴─────────────┐
                 │                            │
           No valid session              Valid session
                 │                            │
                 ▼                            ▼
          ┌─────────────┐          ┌────────────────────┐
          │  AuthView   │          │ role === 'student'? │
          │(Login/      │          └─────────┬──────────┘
          │ Register)   │             yes │        │ no
          └──────┬──────┘                 ▼        ▼
                 │                 SelectorView  TeacherDashboardView
      on success │
                 ▼
        Session stored (cookie)
        App re-renders as logged-in
```

Every screen after login is wrapped by a persistent **Navbar** (top navigation) shown only once a session exists.

---

## 3. Authentication Flow (`AuthView.tsx` → `authRoutes.ts`)

This is the entry gate — nothing else in the app is reachable without it.

1. **On app mount**, `App.tsx` calls `authService.getSession()` → `GET /api/auth/me`.
   - The server reads the `db_session` httpOnly cookie, verifies the JWT, and looks up the account in SQLite.
   - The client **never sees the token or password** — the cookie is invisible to JS, which is what makes this "real auth" rather than mock/localStorage auth.
2. If there's **no valid session**, the user is shown `AuthView`, which has:
   - A **role switch**: `Student` or `Teacher`
   - A **mode switch**: `Register` (new account) or `Login` (existing account)
3. **Student Register** fields: username, password, confirm password, school name, school type (Government/Private/Aided), class (grade), gender, place → `POST /api/auth/student/register`
4. **Teacher Register** fields: teacher code, password, confirm password, school name, school type, class taught → `POST /api/auth/teacher/register`
5. **Login** (either role) only needs the identifier (username / teacher code) + password → `POST /api/auth/student/login` or `/teacher/login`
6. On the server:
   - Passwords are hashed with **bcrypt** (10 salt rounds) before being stored — plaintext passwords never touch the database.
   - On success, the server signs a **JWT** (`{ role, id }`, 30-day expiry) and sets it as an `httpOnly`, `SameSite=Lax` cookie.
   - Duplicate usernames/teacher codes are rejected (`409`), wrong credentials return `401`.
7. On successful register/login, the client calls `onAuthenticated(user)`:
   - **Student** → lands on `SelectorView`, with their registered `grade` pre-filled.
   - **Teacher** → lands directly on `TeacherDashboardView`.
8. **Logout** clears the cookie server-side (`POST /api/auth/logout`) and resets local state, returning the user to `AuthView`.

---

## 4. Student Flow

Once logged in, a student moves through four connected views, all reachable from the **Navbar**: `Ask a Doubt`, `Practice`, `Scholarships`, plus a floating **Session Log**.

### 4.1 `SelectorView` — Curriculum Setup ("Home")
The student's starting screen after login. They pick, in order:
1. **Board** (NCERT / TSCERT / State Boards)
2. **Subject** (filtered to subjects available for the chosen board)
3. **Grade/Class**
4. **Response language** (English / Hindi / Telugu)

A "sun" progress graphic visually fills in as each choice is made. Once Board + Subject + Grade are all selected, the student can either:
- Tap a **suggested/frequent doubt prompt**, or
- Type their own question and hit **Start**

Both paths call `onStartChat(prompt?)`, which sets `currentView = 'chat'` (and optionally pre-fills the first question).

### 4.2 `ChatView` — Ask a Doubt
The core tutoring experience.
1. The student's question is first matched locally against a **curriculum knowledge base** (`findCurriculumChunk` in `apiService.ts`) — a keyword/token-scoring search scoped strictly to the selected Board + Grade + Subject, so answers stay on-syllabus.
2. The question (plus any matched textbook excerpt) is sent to `POST /api/ai/doubt`.
3. The server builds a system prompt instructing Gemini to act as an empathetic tutor, answer step-by-step, respond in the selected language, use relatable analogies, and stay grounded in the textbook excerpt — then calls Gemini (`gemini-3.7-flash`, with automatic fallback to other Gemini models).
4. **If Gemini is unavailable**, the server does **not** fail — it falls back to composing an answer directly from the matched textbook chunk (content, formulas, summary points), so the student always gets a curriculum-accurate response.
5. Each answer is shown with its **textbook citation** (textbook/chapter/section), and the student can mark it 👍/👎 helpful — this is written to the session's `InteractionLogEntry` list (visible via the Session Log modal, and aggregated for teachers).
6. From here the student can jump to **Practice** for the current topic (`onOpenPracticeWithTopic`) or go back to `SelectorView` to change subject/grade.

### 4.3 `PracticeView` — Adaptive Practice
1. Requests `POST /api/ai/practice` with board/subject/grade/chapter/difficulty (and any recent mistakes), asking Gemini to generate 3 MCQ practice questions as strict JSON.
2. The student answers each question; correctness is checked client-side and an explanation is shown.
3. If a question stumps the student, they can send it straight into `ChatView` via `onAskDoubtFromQuestion`, closing the loop between practicing and asking doubts.

### 4.4 `ScholarshipView`
A curated, filterable list of scholarships (from `scholarshipData.ts`) relevant to the student's grade/board — eligibility, grant amount, deadline, required documents, and application link. This is static reference data, not AI-generated.

### 4.5 Session Log (`SessionLogModal`)
A running log of every doubt asked in the session (topic, question, helpfulness rating, timestamp) — opened from the Navbar at any point, mainly for the student (and teacher, conceptually) to review recent activity.

---

## 5. Teacher Flow

A teacher never sees the student selector/chat/practice/scholarship screens — logging in as a teacher routes straight to `TeacherDashboardView`.

1. On mount, it calls `GET /api/auth/teacher/roster`, which the server resolves to **only the students who share the teacher's `class_taught` (grade) and `school_name`** — a teacher only ever sees their own class.
2. The dashboard surfaces:
   - **Most-struggled topics** across the class (aggregated from doubt/practice activity), with a 6-week trend.
   - **Per-student struggle records** — urgency level (critical/elevated/watch), number of struggle signals, recent doubts, and a suggested intervention.
   - Drilling into a student or topic calls `POST /api/ai/teacher-insight`, which asks Gemini to produce a short, actionable insight/intervention summary for that student or topic.
3. "Back"/logout from the dashboard ends the session the same way as the student logout (clears the cookie, returns to `AuthView`).

---

## 6. Backend Route Summary

| Route | Purpose |
|---|---|
| `POST /api/auth/student/register` | Create a student account (bcrypt-hashed password) |
| `POST /api/auth/student/login` | Verify credentials, issue session cookie |
| `POST /api/auth/teacher/register` | Create a teacher account |
| `POST /api/auth/teacher/login` | Verify credentials, issue session cookie |
| `GET  /api/auth/me` | Resolve the current session from the cookie |
| `POST /api/auth/logout` | Clear the session cookie |
| `GET  /api/auth/teacher/roster` | Students in the logged-in teacher's grade + school (teacher-only) |
| `POST /api/ai/doubt` | Curriculum-grounded AI explanation for a student's question |
| `POST /api/ai/practice` | Generate adaptive MCQ practice questions |
| `POST /api/ai/teacher-insight` | AI-generated insight for a struggling student/topic |
| `POST /api/ai/explain-simpler` | Re-explain a previous answer in simpler terms |
| `GET  /api/health` | Basic server/AI-key health check |

---

## 7. Running It Locally

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY and JWT_SECRET
npm run dev                  # starts Express + Vite (middleware mode) on :3000
```

- `GEMINI_API_KEY` — required for live AI answers (the app still degrades gracefully to curriculum-only answers without it).
- `JWT_SECRET` — required in production to sign session cookies; a warning-only insecure default is used in dev if unset.
- The SQLite database file is created automatically on first run at `data/doubtbridge.db`.

---

## 8. One-Paragraph Summary

A visitor lands on the app and is immediately gated by **AuthView**, where they register or log in as either a **Student** or a **Teacher** against a real bcrypt+JWT+SQLite backend. A logged-in **student** picks their Board/Subject/Grade/Language in **SelectorView**, then asks questions in **ChatView** (answered by curriculum-matched Gemini responses with textbook citations), can practice adaptive MCQs in **PracticeView**, browse **ScholarshipView**, and review their activity in the **Session Log**. A logged-in **teacher** instead lands on **TeacherDashboardView**, seeing only their own class's roster and AI-generated insights into which students and topics need attention.
