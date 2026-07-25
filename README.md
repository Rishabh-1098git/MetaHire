# MetaHire

**AI-powered mock interview platform** that helps candidates practice technical and behavioral interviews with resume-aware question generation, live AI proctoring, in-browser code execution, and per-question feedback scoring.

Live: [metahire.vercel.app](https://metahire.vercel.app)

---

## Overview

MetaHire simulates a real interview from end to end:

1. Candidate uploads a resume and picks a role, level, target company, and tech stack.
2. Google Gemini generates 10 personalized questions (8 behavioral/technical/resume-based + 2 coding problems) using the extracted resume text.
3. The candidate takes the interview in a fullscreen, proctored environment with webcam, speech-to-text answers, and a multi-language code editor.
4. Gemini scores every answer and returns per-question feedback plus a total score.
5. Results are persisted to the user's history and can be revisited from the dashboard.

---

## Features

### Interview experience
- **Resume-aware question generation** — PDF text is extracted client-side (`react-pdftotext`) and fed into the Gemini prompt so questions reference the candidate's actual projects/skills.
- **Mixed question types** — 8 behavioral/technical/resume questions followed by 2 coding problems with input/output specs.
- **Live speech-to-text** — answers for non-coding questions are captured via the Web Speech API (`react-speech-recognition`).
- **Text-to-speech questions** — each question is spoken aloud via `SpeechSynthesis`.
- **In-browser code editor** — CodeMirror with JavaScript, Python, Java, and C++ support and the One Dark theme.
- **Code execution** — code is run remotely via the Judge0 API; stdout/stderr/compile errors are surfaced in an Output tab.
- **Per-question timer** — 2 minutes for verbal questions, 10 minutes for coding problems, with auto-advance on timeout.

### AI proctoring
- **Object detection** powered by TensorFlow.js + COCO-SSD running on the candidate's webcam feed.
- Detects **multiple people** in frame and **cell phones**, draws bounding boxes on a canvas overlay.
- **Three-strike system** — toasts a warning on each violation; on the 3rd warning the interview is auto-submitted and flagged.
- **Tamper-proofing** — fullscreen is enforced, right-click and `Ctrl+U / Ctrl+S / Ctrl+I` are blocked.
- Graceful fallbacks for denied camera permission, missing camera, or HTTP (non-secure) context.

### Feedback & history
- **Gemini-scored feedback** — every Q/A pair gets a numeric score and a feedback string; total score is aggregated.
- **Per-user interview history** — every completed interview is stored on the user document and browsable from the dashboard.
- **Revisit results** — click any past interview to see questions, answers, scores, and feedback.

### Account & profile
- Email + password auth with JWT (`bcryptjs` for hashing).
- **Forgot password** flow via Nodemailer (Gmail SMTP) with a tokenized reset link.
- Profile editor with name, bio, skills, and avatar upload (stored on Cloudinary).

### Landing page
- Hero, feature cards, AI-assistance highlights, a roadmap section, testimonials, and an FAQ accordion.
- Built with Framer Motion animations and a Tailwind/Radix-based component system.

---

## Tech stack

### Frontend (`FrontEnd/`)
- **React 18** + **Vite 6**
- **Tailwind CSS**, **Radix UI** / shadcn-style components, **Material UI**, **Chakra UI**
- **React Router v7**, **React Hook Form**
- **Framer Motion** for animations
- **CodeMirror** (`@uiw/react-codemirror`) with `@codemirror/lang-{javascript,python,java,cpp}`
- **TensorFlow.js** + **COCO-SSD** for proctoring
- **react-speech-recognition** (STT) and the browser's `SpeechSynthesis` API (TTS)
- **react-pdftotext** / **pdfjs-dist** / **mammoth** for resume parsing
- **Chart.js** + **react-chartjs-2**
- **Sonner** + **react-toastify** for notifications

### Backend (`Backend/`)
- **Node.js** + **Express**
- **MongoDB** via **Mongoose**
- **JWT** auth + **bcryptjs**
- **Multer** + **multer-storage-cloudinary** + **Cloudinary** for photo/resume uploads
- **Nodemailer** (Gmail) for password-reset email
- **`@google/generative-ai`** — `gemini-1.5-flash`

### External services
- **Google Gemini** — question generation & feedback scoring
- **Judge0** (`judge0-ce.p.rapidapi.com`) — remote code execution
- **Cloudinary** — image/PDF storage
- **MongoDB Atlas** (or any Mongo URI)
- **Vercel** — frontend + backend hosting

---

## Project structure

```
MetaHire/
├── Backend/
│   ├── config/db.js                 # Mongo connection
│   ├── controllers/authController.js # signup/signin/profile/forget+reset password
│   ├── middleware/authMiddleware.js  # JWT Bearer protection
│   ├── models/User.js                # User + nested feedback schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── uploadRoutes.js
│   ├── cloudinaryConfig.js
│   ├── multerConfig.js               # photo & resume Cloudinary storage
│   ├── index.js                      # Express app, Gemini endpoints, server start
│   └── vercel.json
└── FrontEnd/
    ├── src/
    │   ├── App.jsx                   # Router + ThemeProvider + Toaster
    │   ├── pages/
    │   │   ├── Home.jsx              # Landing page
    │   │   ├── AuthPage.jsx          # Sign in / Sign up / Forgot password
    │   │   ├── ResetPassword.jsx
    │   │   ├── AdminPage.jsx         # Dashboard shell (sidebar + active component)
    │   │   ├── InterviewSetup.jsx    # Role/level/tech/company/resume form
    │   │   ├── Interview.jsx         # Live interview: proctoring + editor + STT/TTS
    │   │   ├── Feedback.jsx          # View a past interview from history
    │   │   └── Feedback2.jsx         # Post-interview Gemini feedback
    │   └── components/
    │       ├── AppSidebar.jsx        # Dashboard sidebar (Profile, Practice, History, ...)
    │       ├── PracticeInterview.jsx # Setup form rendered inside dashboard
    │       ├── InterviewHistory.jsx  # List of past interviews
    │       ├── Profile.jsx           # Profile view + edit
    │       ├── CodeEditor.jsx
    │       ├── Roadmap.jsx
    │       ├── TestimonialSection.jsx
    │       ├── Header.jsx
    │       └── ui/                   # shadcn-style primitives
    └── vite.config.js
```

---

## API reference

Base URL is whatever `VITE_REACT_APP_BASE_URL` points to (default `http://localhost:5000`).

| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| `POST` | `/api/auth/signup` | — | Register with `{ email, password }`, returns JWT |
| `POST` | `/api/auth/signin` | — | Login, returns JWT |
| `GET`  | `/api/auth/profile` | Bearer | Get current user (email, name, bio, skills, photoUrl, feedbacks) |
| `PUT`  | `/api/auth/profile` | Bearer | Update name/email/bio/skills/photoUrl |
| `POST` | `/api/auth/forget-password` | — | Email a reset link to the user |
| `POST` | `/api/auth/reset-password/:token` | — | Set a new password using the emailed token |
| `POST` | `/api/gemini` | — | Generate interview questions from a free-form prompt; returns `{ questions: string[] }` |
| `POST` | `/api/gemini/feedback` | — | Score `questionsAndAnswers[]`, returns `{ feedback, totalScore }` |
| `POST` | `/api/user/feedback` | Bearer | Persist a finished interview to the user's history |
| `POST` | `/api/user/get-feedback` | Bearer | Return the full user document with `feedbacks[]` |
| `POST` | `/upload-photo` | — | Multipart upload (`photo` field) → Cloudinary `user_photos/` |
| `POST` | `/upload-resume` | — | Multipart upload (`resume` field) → Cloudinary `user_resumes/` |
| `GET`  | `/` | — | Liveness ("API is running...") |
| `GET`  | `/ping` | — | Returns "pong" |

---

## Frontend routes

| Path | Component | Protected |
| ---- | --------- | --------- |
| `/` | `Home` | — |
| `/signingsignup` | `AuthPage` | — |
| `/reset-password/:token` | `ResetPassword` | — |
| `/admin` | `AdminPage` (dashboard shell) | ✓ |
| `/admin/interview/:interviewId` | `Interview` (live interview) | ✓ |
| `/admin/interview/results/:interviewId` | `Feedback2` (AI feedback) | ✓ |
| `/admin/view-interview` | `Feedback` (history detail) | ✓ |

Protection is implemented client-side by checking `localStorage.token` in `ProtectedRoute`.

---

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string
- A Google Generative AI API key (`gemini-1.5-flash`)
- A Cloudinary account (for photo/resume uploads)
- A Judge0 RapidAPI key (the current key is hardcoded in `Interview.jsx`; replace it for your own deployment)
- A Gmail account + app password for Nodemailer (password-reset email)

### 1. Clone and install

```bash
git clone <repo-url> MetaHire
cd MetaHire

# Backend
cd Backend
npm install

# Frontend
cd ../FrontEnd
npm install
```

### 2. Environment variables

**`Backend/.env`**

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=replace-me

GOOGLE_GENAI_API_KEY=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Nodemailer (Gmail)
MY_GMAIL=you@gmail.com
MY_PASSWORD=app-password

# Used to build the reset-password link sent over email
CLIENT_URL=http://localhost:5173
```

**`FrontEnd/.env`**

```env
VITE_REACT_APP_BASE_URL=http://localhost:5000
```

### 3. Run

```bash
# Backend (port 5000)
cd Backend
npm start

# Frontend (Vite dev server)
cd FrontEnd
npm run dev
```

> Webcam access requires a **secure context** — use `localhost` or HTTPS. The proctoring code refuses to initialize otherwise.

---

## Data model

```js
// models/User.js
User {
  email, password (hashed), name, bio, skills[], photoUrl,
  feedbacks: [
    {
      feedbacks: [{ question, answer, score, feedback }],
      totalScore, role, company, createdAt
    }
  ],
  createdAt, updatedAt
}
```

The `feedbacks` array is the user's full interview history; each entry is one completed interview.

---

## Deployment

Both packages ship with `vercel.json` and the live deployment is at `metahire.vercel.app`. The backend's CORS allow-list includes `https://metahire.vercel.app` and `http://localhost:3000`; update it if you deploy under a different origin.

---

## Known gaps & rough edges

These are visible from a code scan and worth discussing before the next iteration:

- **Hardcoded Judge0 API key** in `FrontEnd/src/pages/Interview.jsx` — ships in the client bundle.
- **`POST` for read-only endpoints** — `/api/user/get-feedback` should be `GET`.
- **`InterviewSetup.jsx` is unused** — `PracticeInterview.jsx` is a near-duplicate rendered inside the dashboard; one should be deleted.
- **Route name `/signingsignup`** is a typo and is used throughout navigation.
- **Auth lives in `localStorage`** — vulnerable to XSS; no refresh-token flow.
- **CORS is registered twice** in `Backend/index.js` (`app.use(cors())` then a configured `app.use(cors({...}))`).
- **`AppSidebar` has typos** — `"Perfomance Analysis"`, and three menu items are "Coming soon…" placeholders.
- **No tests** in either package.
- **Proctoring runs at ~1 fps** and only detects two classes (person, cell phone); no face/gaze tracking despite `@mediapipe/face_mesh` and `@mediapipe/pose` being installed.
- **`ProtectedRoute .jsx`** (note trailing space) is the filename — fragile on case-sensitive filesystems.

---

## License

ISC (per `Backend/package.json`). Frontend is unlicensed in `FrontEnd/package.json`.
\n<!-- test PR validation checks -->
