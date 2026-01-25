# Deployment Guide

Complete guide for deploying the Underdog AI Sales Coach application to production.

## Prerequisites

Before deploying, ensure you have:

- **Node.js 18+** - Required for Next.js 16
- **npm** or **pnpm** - Package manager
- **Git** - Version control
- **Vercel account** - Deployment platform
- **Supabase project** - Database and authentication
- **VAPI account** - Voice AI platform
- **OpenRouter account** - LLM API access
- **OpenAI account** - Whisper transcription
- **Sentry account** (optional) - Error tracking

---

## Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd under
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see Environment Variables section below).

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 5. Verify Setup

```bash
npm run typecheck  # Check TypeScript
npm run lint       # Check linting
npm run build      # Verify production build
```

---

## Environment Variables

### Required Variables

These environment variables are **required** - the application will not start without them.

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard > Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (never expose to client) | Supabase Dashboard > Settings > API > service_role |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | VAPI public key for client-side calls | VAPI Dashboard > Settings > API Keys |
| `VAPI_PRIVATE_KEY` | VAPI private key for server-side operations | VAPI Dashboard > Settings > API Keys |
| `VAPI_WEBHOOK_SECRET` | Webhook signature verification secret | VAPI Dashboard > Webhooks > Signing Secret |
| `OPENAI_API_KEY` | OpenAI API key for Whisper transcription | OpenAI Dashboard > API Keys |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | OpenRouter Dashboard > Keys |

### Optional Variables

These variables are optional. Features will degrade gracefully if not set.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN for error tracking | (error tracking disabled) |
| `NEXT_PUBLIC_SITE_URL` | Production URL for absolute links | `https://under-eight.vercel.app` |
| `RETELL_API_KEY` | Retell AI API key (alternative voice platform) | (Retell features disabled) |

### Environment Variable Format

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# VAPI
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_...
VAPI_PRIVATE_KEY=sk_...
VAPI_WEBHOOK_SECRET=whsec_...

# OpenAI & OpenRouter
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Site URL (optional)
NEXT_PUBLIC_SITE_URL=https://under-eight.vercel.app
```

---

## Vercel Deployment

### 1. Import Project

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." > "Project"
3. Import from GitHub repository
4. Vercel will auto-detect Next.js

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js (auto-detected) |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `.next` |

### 3. Add Environment Variables

1. Go to Project Settings > Environment Variables
2. Add all required variables from the table above
3. Set scope to "Production", "Preview", and "Development" as appropriate

**Security Note:** Never add `SUPABASE_SERVICE_ROLE_KEY` to client-side code. It should only be used in server-side API routes.

### 4. Deploy

1. Push to your main branch
2. Vercel will automatically build and deploy
3. Access your app at the provided `.vercel.app` URL

### 5. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

---

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com) and log in
2. Click "New Project"
3. Choose organization and set project name
4. Select region closest to your users
5. Set a strong database password

### 2. Apply Database Migrations

The project includes 10 migrations in `supabase/migrations/`. Apply them in order.

**Option A: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Option B: Using SQL Editor**

1. Go to Supabase Dashboard > SQL Editor
2. Open each migration file from `supabase/migrations/` in order
3. Run each migration sequentially

**Migration Order:**
- `001_` - Base tables (users, sessions)
- `002_` - Scoring schema
- `003_` - Call uploads
- `004_` - Curriculum progress
- `005_` - Knowledge base with pgvector
- `006_` - Audit logging
- `007_` - RLS policies
- `008_` - Storage buckets
- `009_` - Triggers and functions
- `010_` - Indexes and performance

### 3. Configure Storage

1. Go to Supabase Dashboard > Storage
2. Create bucket: `call-recordings`
3. Set bucket policy to allow authenticated uploads

```sql
-- Storage policy for call-recordings bucket
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'call-recordings');

CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'call-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Enable Authentication

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Email provider (required)
3. Optionally enable Google, GitHub OAuth

### 5. Verify RLS Policies

All tables have Row Level Security enabled. Verify policies are active:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## Post-Deployment Checklist

After deployment, verify everything works:

- [ ] **Health Check**: `GET /api/health` returns `{ status: 'healthy' }`
- [ ] **Authentication**: Users can sign up and log in
- [ ] **Voice Practice**: VAPI calls start and receive webhook events
- [ ] **Call Analysis**: Audio uploads transcribe and score correctly
- [ ] **Chat Coaching**: AI responses include knowledge base context
- [ ] **Error Tracking**: Errors appear in Sentry (if configured)

---

## Troubleshooting

### Build Errors

```bash
# Run locally first to catch errors
npm run typecheck
npm run lint
npm run build
```

### Authentication Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match dashboard
2. Check Supabase Dashboard > Authentication > URL Configuration
3. Ensure site URL is added to allowed redirect URLs

### API Errors

1. Check Vercel logs: Project > Deployments > Functions
2. Verify all environment variables are set correctly
3. Ensure service accounts have required permissions

### VAPI Webhook Failures

1. Verify `VAPI_WEBHOOK_SECRET` matches VAPI Dashboard > Webhooks
2. Check webhook URL is accessible: `https://your-domain/api/vapi/webhook`
3. Verify webhook events are enabled in VAPI Dashboard
4. Check Vercel function logs for signature verification errors

### Database Connection Issues

1. Verify Supabase project is running (not paused)
2. Check connection pooler settings for production
3. Verify RLS policies don't block required operations

---

## Related Documentation

- [INTEGRATIONS.md](./INTEGRATIONS.md) - External service setup (VAPI, OpenRouter, Sentry)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design overview
- [API.md](./API.md) - API reference documentation

---

*Last updated: 2026-01-25*
