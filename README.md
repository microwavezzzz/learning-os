# Learning OS — AI-Augmented Personal Learning Management System

**Learning OS** is a production-grade Personal Learning Management System designed to turn fragmented learning materials into structured learning progress and measurable mastery.

---

## 🔄 The Core Learning Loop

$$\text{Google Drive / Materials} \rightarrow \text{Curriculum} \rightarrow \text{Adaptive Plan} \rightarrow \text{Focus Session} \rightarrow \text{Active Recall} \rightarrow \text{Mistake Bank} \rightarrow \text{FSRS-4.5} \rightarrow \text{Mastery} \rightarrow \text{AI Recommendation}$$

```
Materials (Bank Materi Sains Data)
  │
  ▼
Curriculum & Concepts Hierarchy (Subjects → Topics → Subtopics → Concepts)
  │
  ▼
Goal-Driven Adaptive Study Plan (Spaced, Linear, Exam Sprint)
  │
  ▼
Focus Study Mode (Pomodoro 25/5 & Deep Work 50/10 with Scratchpad)
  │
  ▼
Active Recall & Quizzes (Multiple Choice, Cloze, Semantic Evaluation)
  │
  ├──► Incorrect Answers ──► Mistake Bank (Root Cause Diagnosis & Remediation)
  │
  ▼
FSRS-4.5 Memory Scheduling (Stability, Difficulty, Retrievability)
  │
  ▼
Cognitive Mastery Engine (0–100% Score across 5 weighted dimensions)
  │
  ▼
AI Daily Recommendations & Learning Analytics (Heatmap & Retention Curves)
```

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router) & React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Design System Tokens (Dark/Light/System)
- **Primitives**: Radix UI & Lucide Icons
- **Database**: SQLite with WAL mode & Foreign Keys (`better-sqlite3`)
- **Validation**: Zod (Structured outputs and runtime validation)
- **Spaced Repetition**: Modern FSRS-4.5 Algorithm
- **AI Architecture**: Provider-Agnostic AI Gateway with prompt-injection boundary (`<untrusted_material_content>`)

---

## 📦 Complete Product Domains Implemented

1. **Authentication & Identity**: Google Sign-In hook, email authentication, demo mode, secure session abstraction, user preference persistence.
2. **Curriculum & Knowledge Hierarchy**: Subjects $\rightarrow$ Topics $\rightarrow$ Subtopics $\rightarrow$ Concepts with Bloom taxonomy, estimated minutes, and prerequisite graph.
3. **Google Drive Integration & Material Hub**:
   - Primary connected folder: **Bank Materi Sains Data (BMSD)** (`1p5n-lsYEDVSCliHMIhVKJxbdH46GnpBP`).
   - Read-only (`drive.file`) metadata synchronization and material browser.
4. **Document Processing & Dual-Pane Reader**:
   - Left Pane: Document text and chunk viewer with page navigation, zoom, and text selection.
   - Right Pane: Active study notes, concept dictionary, and Feynman AI concept explainer.
5. **Goal-Driven Adaptive Scheduler**:
   - Generates daily study queues for targets (e.g. &ldquo;OS Exam in 30 days&rdquo;, &ldquo;Master React in 3 weeks&rdquo;).
   - Dynamic rescheduling for missed sessions.
6. **Focus Study Sessions & Pomodoro**:
   - 25/5 Pomodoro, 50/10 Deep Work, digital countdown timer, actual elapsed time tracker.
   - Live study scratchpad and micro-checkpoints checklist.
   - Post-session reflection flow (What did you learn? Difficulties? Confidence? Review items?).
7. **Active Recall & Quiz Engine**:
   - Multiple Choice, Cloze, and Short Answer question support.
   - Live AI semantic answer evaluation with structured feedback.
   - Grounded question generation from material chunks.
8. **Mistake Bank & Root-Cause Diagnosis**:
   - Categorized by: `conceptual_gap`, `recall_lapse`, `execution_slip`, `misread_trick`.
   - Actionable suggested remedies and 1-click remediation drills.
9. **FSRS-4.5 Spaced Repetition**:
   - Computes memory stability ($S$), difficulty ($D$), and retrievability ($R$) on rating outcomes (Again, Hard, Good, Easy).
10. **Cognitive Mastery Engine**:
    - Multi-factor mastery score (0–100%) combining quiz accuracy (35%), FSRS stability (25%), study volume (20%), mistake health (10%), and confidence (10%).
11. **AI Gateway & Feynman Tutor**:
    - Provider-agnostic router (Gemini, Anthropic, OpenAI, Local, Rule-Based).
    - Prompt injection protection via sanitization delimiters.
12. **Learning Analytics & Command Center**:
    - 14-day study activity heatmap.
    - Subject mastery velocity bars.
    - FSRS forgetting curve modeling.
13. **System Settings**:
    - Drive source configuration, AI model selection, study interval preferences.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build and Run Production Server
```bash
npm run build
npm run start
```
Access the application at `http://localhost:3000`.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in [Vercel](https://vercel.com/new) and keep the detected Next.js settings.
3. Add the variables from `.env.example` in **Project Settings → Environment Variables**.
4. Deploy the project.

### Database requirement

The current repositories use `better-sqlite3` and write to `data/learning_os.db`. This works locally, but Vercel serverless functions do not provide persistent writable storage. A Vercel deployment therefore needs the repositories migrated to a hosted PostgreSQL-compatible database before user data, progress, and generated quizzes can be persisted reliably. `src/db/index.ts` contains the initial `DATABASE_URL` configuration boundary for that migration.

Until that migration is complete, use the Vercel deployment only as a build/UI preview. Do not use it as the production data store.

---

## 🧪 Test Suites

Run the automated test suites:
- **Full Learning Loop Integration**: `node src/test-full-loop.js` (14/14 tests)
- **Study System & Pomodoro**: `node src/test-study-system.js` (11/11 tests)
- **Dashboard Integrity**: `node src/test-dashboard.js` (9/9 tests)
- **CRUD Operations**: `node src/test-crud.js` (16/16 tests)
