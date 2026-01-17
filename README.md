# Underdog AI Sales Coach

AI-powered sales training platform for the Underdog Sales methodology by Giulio Segantini.

## Features

### Voice Practice
- **6 AI Personas**: Practice cold calls with distinct AI prospects (CFO, VP Sales, Gatekeeper, Ops Manager, Marketing Director, Biz Dev)
- **5 Scenario Types**: Full cold call, opener practice, objection gauntlet, deep discovery, gatekeeper navigation
- **Real-time Scoring**: Get immediate feedback on 6 dimensions (Opener, Pitch, Discovery, Objection Handling, Closing, Communication)
- **Live Transcript**: See conversation in real-time during practice

### Chat Coaching
- **Coach Giulio**: Text-based coaching with the Underdog methodology
- **4 Coaching Modes**: Curriculum, objections, techniques, free coaching
- **Context-aware**: Powered by RAG with knowledge base search

### Call Analysis
- **Upload Recordings**: Drag-drop MP3, WAV, M4A, WebM, OGG files (up to 100MB)
- **AI Transcription**: Powered by OpenAI Whisper with speaker diarization
- **Detailed Scoring**: Same 6-dimension rubric as practice sessions
- **Actionable Feedback**: Strengths, improvements, and specific recommendations

### Curriculum
- **12 Modules**: Complete Underdog cold calling methodology
- **Progress Tracking**: Sequential unlock as you complete modules
- **Module Content**: Video lessons, practice exercises, knowledge checks

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Voice AI**: VAPI (ElevenLabs voices + Deepgram STT)
- **LLM**: OpenAI GPT-4o (via OpenRouter)
- **Transcription**: OpenAI Whisper
- **Embeddings**: text-embedding-3-small (pgvector)

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- VAPI account
- OpenAI API key

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# VAPI
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
VAPI_PRIVATE_KEY=

# OpenAI (for Whisper transcription + chat)
OPENAI_API_KEY=

# OpenRouter (for embeddings)
OPENROUTER_API_KEY=
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── analyze/           # Call analysis feature
│   ├── chat/              # Chat coaching
│   ├── coach/             # Voice coaching with Giulio
│   ├── curriculum/        # 12-module curriculum
│   ├── practice/          # Voice practice with personas
│   └── api/               # API routes
├── components/
│   ├── analyze/           # Call analysis components
│   ├── chat/              # Chat components
│   ├── curriculum/        # Curriculum components
│   ├── ui/                # Shared UI components
│   └── voice/             # Voice practice components
├── config/
│   ├── coach.ts           # Giulio coach config
│   ├── curriculum.ts      # 12 modules config
│   ├── personas.ts        # 6 AI personas
│   └── rubric.ts          # Scoring rubric (6 dimensions, 19 criteria)
├── lib/
│   ├── actions/           # Server actions
│   ├── scoring/           # Scoring engine
│   ├── supabase/          # Supabase client + types
│   ├── transcription/     # Whisper client
│   └── vapi/              # VAPI client
└── types/                 # TypeScript types
```

## Database Schema

Key tables:
- `users` - User accounts (Supabase Auth)
- `roleplay_sessions` - Voice practice sessions
- `call_uploads` - Uploaded call recordings + analysis
- `curriculum_progress` - User progress through modules
- `knowledge_base` - RAG knowledge chunks with embeddings

## Deployment

The app auto-deploys to Vercel on push to main.

```bash
# Manual deploy
vercel --prod
```

## License

Proprietary - Qualia Solutions x GSC Underdog Sales LTD

---

*Built by [Qualia Solutions](https://qualia.solutions)*
