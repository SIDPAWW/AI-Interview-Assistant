# AI-Interview Assistant 

## Project info

**URL**: https://lovable.dev/projects/46cd7afd-b3fb-42fb-a36c-a776c38ac039

````markdown
# AI Interview Assistant

AI Interview Assistant is a small web application that helps run AI-powered technical interviews. It can:

- Generate role-focused interview questions (the project currently targets full-stack / React + Node.js questions).
- Present an interview flow for a candidate (resume upload -> info collection -> live Q&A).
- Evaluate candidate answers using an AI evaluator and produce a final summary and score.
- Provide an interviewer dashboard to review completed interviews and candidate scores.

This project is built with Vite, React, and TypeScript and uses Tailwind CSS + shadcn-ui for the UI.

## Quick start (local development)

Prerequisites:

- Node.js 18+ and npm (or yarn/pnpm).
- An OpenAI API key (the app calls the OpenAI API from the client; for production you should proxy requests through a server to keep the key secret).

1. Clone the repository and install dependencies:

```powershell
git clone https://github.com/SIDPAWW/AI-Interview-Assistant
cd AI-Interview-Assistant
npm install
```

2. Create a .env file in the project root with your OpenAI key:

```text
# .env
VITE_OPENAI_API_KEY=sk-...your-openai-key-here...
```

3. Start the dev server:

```powershell
npm run dev
```

Open http://localhost:5173 in your browser (Vite default port). If Vite chooses a different port it will show in the terminal.

## Available scripts

- npm run dev — Start dev server (Vite)
- npm run build — Build production bundle
- npm run build:dev — Build with development mode
- npm run preview — Preview the production build locally
- npm run lint — Run ESLint

## Environment variables

- VITE_OPENAI_API_KEY — required for generating questions and evaluating answers. If this is missing the app will throw an error when trying to call the OpenAI API.

Important: Do not commit secrets. For production, host a small serverless function or API proxy that forwards requests to OpenAI and keeps your key out of client bundles.

## What the app does (implementation notes)

- Question generation: implemented in `src/utils/aiService.ts` (function `generateInterviewQuestions`). It calls OpenAI to produce a JSON array of questions.
- Answer evaluation: `evaluateAnswer` sends a prompt to OpenAI and expects a numeric score (0–100).
- Final summary: `generateFinalSummary` creates a short summary from answered questions.
- Interview flow: `src/pages/IntervieweePage.tsx` drives the candidate flow (resume upload → info collection → interview chat).
- Interviewer dashboard: `src/pages/InterviewerPage.tsx` lists candidates, scores, and details.

Data is stored client-side in Redux (`src/redux`) and persisted with `redux-persist` so sessions survive a browser refresh.

## Project structure (important files)

- src/pages — top-level pages (Index, IntervieweePage, InterviewerPage)
- src/components — UI components used by pages (ResumeUpload, InterviewChat, Interviewer UI kit)
- src/redux — Redux store and slices (candidate state and persistence)
- src/utils/aiService.ts — OpenAI integration helpers (generate/evaluate/summary)

## Deployment

Build the app and deploy the static output to any static hosting provider (Vercel, Netlify, GitHub Pages). Example build steps:

```powershell
npm run build
npm run preview    # quick local check of the production build
```

Notes:

- Because the app calls OpenAI from the browser, your API key may be exposed in production builds. Move OpenAI calls to a server endpoint (serverless functions on Vercel/Netlify) and call that endpoint from the client.
- Configure environment variables on your hosting provider (Vercel/Netlify) rather than committing them to the repo.



````
