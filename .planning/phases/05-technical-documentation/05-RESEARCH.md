# Phase 5: Technical Documentation - Research

**Researched:** 2026-01-25
**Domain:** Technical Documentation / API Reference / Deployment Guides
**Confidence:** HIGH

## Summary

This phase involves creating comprehensive technical documentation for the Underdog AI Sales Coach platform, enabling smooth handover and onboarding of new developers. The codebase already has a well-structured CLAUDE.md that serves as an excellent starting template, but lacks formal documentation for APIs, database schema, deployment procedures, and integration guides.

The documentation will be organized into 5 Markdown files covering architecture, APIs, deployment, database schema, and external integrations. The existing codebase is well-commented with JSDoc-style comments in key utilities (circuit-breaker, logger), but API routes lack formal documentation. The database has 10 migrations with inline SQL comments that can be extracted.

**Primary recommendation:** Create Markdown documentation files directly from codebase analysis - no external libraries needed. Use the existing CLAUDE.md as the architecture foundation, extract API contracts from route files, and consolidate migration comments into database documentation.

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | N/A | Documentation format | Universal, works with GitHub/GitLab, no build step |
| JSDoc comments | N/A | Inline code documentation | Already present in codebase, extractable |
| Mermaid diagrams | N/A | Architecture diagrams | GitHub-native rendering, text-based |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| GitHub Pages | Host docs | If external access needed |
| Docusaurus | Doc site generator | Only if dynamic docs site required |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown | OpenAPI/Swagger | Better for REST APIs but overkill for internal docs |
| Markdown | GitBook | Nice UI but adds dependency |
| Mermaid | draw.io | More features but binary files, harder to maintain |

**Installation:**
```bash
# No installation needed - pure Markdown approach
```

## Architecture Patterns

### Recommended Documentation Structure
```
docs/
├── ARCHITECTURE.md    # System overview, component relationships
├── API.md             # All API endpoints documented
├── DEPLOYMENT.md      # Vercel setup, env vars, Supabase config
├── DATABASE.md        # Schema, RLS policies, migrations
└── INTEGRATIONS.md    # VAPI, OpenRouter, Sentry setup
```

### Pattern 1: API Endpoint Documentation
**What:** Consistent format for each API route
**When to use:** Every endpoint in `src/app/api/`
**Example:**
```markdown
### POST /api/chat

Chat with the AI sales coach using RAG-enhanced responses.

**Authentication:** Required (Supabase Auth)
**Rate Limit:** 30 requests/minute per user

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| messages | Array<{role, content}> | Yes | Conversation history |
| mode | string | No | Coaching mode: curriculum, objections, techniques, free |

**Response:**
| Field | Type | Description |
|-------|------|-------------|
| message | string | AI response |

**Error Responses:**
| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid auth token |
| 429 | Rate limited | Too many requests |
| 503 | Service unavailable | Circuit breaker open |
```

### Pattern 2: Database Table Documentation
**What:** Schema documentation with RLS policies
**When to use:** Every table in database
**Example:**
```markdown
### roleplay_sessions

Voice practice session records.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key |
| user_id | UUID | No | FK to users.id |
| persona_id | TEXT | No | AI persona used |
| scenario_type | TEXT | No | cold_call, objection, closing, gatekeeper |
| transcript | JSONB | Yes | Conversation transcript |
| deleted_at | TIMESTAMPTZ | Yes | Soft delete timestamp |

**RLS Policies:**
- Users can view their own sessions (deleted_at IS NULL)
- Users can insert their own sessions
- Admins can view all sessions
```

### Pattern 3: Environment Variable Documentation
**What:** All env vars with descriptions and examples
**When to use:** DEPLOYMENT.md
**Example:**
```markdown
## Environment Variables

### Required (App will not start without these)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public anon key | eyJhb... |
| SUPABASE_SERVICE_ROLE_KEY | Server-side admin key | eyJhb... |

### Optional (Features degrade gracefully)

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_SENTRY_DSN | Sentry project DSN | (disabled) |
```

### Anti-Patterns to Avoid
- **Copy-paste from source code:** Extract patterns, don't dump code
- **Stale examples:** Use actual values from codebase, not invented ones
- **Missing error codes:** Document all error responses, not just success
- **Undocumented RLS:** Every table needs RLS policy documentation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API docs format | Custom format | OpenAPI-inspired Markdown tables | Familiar to developers |
| Diagrams | ASCII art | Mermaid flowcharts | Renders in GitHub, maintainable |
| Schema extraction | Manual transcription | Query from Supabase types.ts | Already generated, always accurate |
| Code examples | Made-up examples | Extract from actual source files | Tested, working code |

**Key insight:** The codebase already contains all the documentation content - it just needs to be reorganized and formatted for human consumption.

## Common Pitfalls

### Pitfall 1: Documentation Drift
**What goes wrong:** Docs become outdated as code changes
**Why it happens:** Docs not updated in same PRs as code changes
**How to avoid:** Keep docs minimal, link to source files where possible
**Warning signs:** Version numbers in docs don't match package.json

### Pitfall 2: Over-Documentation
**What goes wrong:** Too much detail makes docs unusable
**Why it happens:** Trying to document every line of code
**How to avoid:** Focus on "what" and "why", not "how" (code shows how)
**Warning signs:** Docs longer than the code they describe

### Pitfall 3: Missing Context
**What goes wrong:** New developers can't understand the "why"
**Why it happens:** Only documenting current state, not decisions
**How to avoid:** Include brief rationale for architectural choices
**Warning signs:** Developers asking "why is it done this way?"

### Pitfall 4: Forgetting Security Docs
**What goes wrong:** Security patterns not documented, bypassed by new devs
**Why it happens:** Security seems "obvious" to original developers
**How to avoid:** Explicit section on RLS, auth requirements, webhook verification
**Warning signs:** New features deployed without proper auth checks

## Code Examples

### Example 1: Extracting API Contracts from Route Files

The codebase has well-typed route handlers. Extract these patterns:

```typescript
// From src/app/api/analyze/upload/route.ts
// Rate limit: RATE_LIMITS.upload (from src/lib/rate-limit.ts)
// Max file size: 100MB
// Allowed types: audio/mpeg, audio/mp3, audio/wav, audio/webm, audio/ogg, audio/m4a

// From src/app/api/chat/route.ts
// Schema: ChatRequestSchema (from src/lib/validations.ts)
// Circuit breaker: openrouterCircuit (30s reset, 5 failures)
```

### Example 2: Database Schema from Types

The `src/lib/supabase/types.ts` is auto-generated and authoritative:

```typescript
// Extract table schemas from:
// Database['public']['Tables']['roleplay_sessions']['Row']

// Extract RPC functions from:
// Database['public']['Functions']['match_knowledge']
```

### Example 3: Mermaid Architecture Diagram

```markdown
```mermaid
flowchart TB
    subgraph Client
        UI[React UI]
        VAPI[VAPI Web SDK]
    end

    subgraph "Next.js API Routes"
        CHAT[/api/chat]
        WEBHOOK[/api/vapi/webhook]
        ANALYZE[/api/analyze/*]
        HEALTH[/api/health]
    end

    subgraph External
        OPENROUTER[OpenRouter LLM]
        VAPICLOUD[VAPI Cloud]
        WHISPER[OpenAI Whisper]
    end

    subgraph Supabase
        AUTH[(Auth)]
        DB[(PostgreSQL + pgvector)]
        STORAGE[(Storage)]
    end

    UI --> CHAT
    VAPI --> VAPICLOUD
    VAPICLOUD --> WEBHOOK
    CHAT --> OPENROUTER
    ANALYZE --> WHISPER
    ANALYZE --> STORAGE
    All --> AUTH
    All --> DB
```
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| README.md only | Structured docs/ folder | 2024+ | Better discoverability |
| Swagger/OpenAPI | Markdown tables for internal APIs | Ongoing | Simpler for small teams |
| Confluence/Wiki | In-repo markdown | 2023+ | Docs stay with code |
| Manual schema docs | Extract from TypeScript types | Supabase CLI | Always accurate |

**Deprecated/outdated:**
- Separate documentation repos (should live with code)
- Generated API docs from decorators (Next.js doesn't use them)

## Content Extraction Strategy

### From CLAUDE.md (already exists)
- Project context
- Tech stack
- Quick commands
- Key directories
- Environment variables overview
- Architecture notes (Voice Practice Flow, Call Analysis Flow, Chat Coaching Flow)
- Database overview
- Security overview
- Observability overview
- Common tasks

### From API Route Files
- All endpoints in `/src/app/api/`
- Request/response schemas
- Rate limits (from `src/lib/rate-limit.ts`)
- Error codes (from `src/lib/errors.ts`)
- Authentication requirements

### From Database Migrations
- Table schemas
- Column descriptions (from SQL comments)
- RLS policies
- Triggers and functions
- Storage bucket configuration

### From Config Files
- `src/config/personas.ts` - AI persona configuration
- `src/config/rubric.ts` - Scoring rubric
- `src/config/curriculum.ts` - Curriculum modules
- `src/config/admin.ts` - Admin configuration

### From Integration Code
- `src/lib/vapi/` - VAPI integration details
- `src/lib/knowledge.ts` - RAG implementation
- `src/lib/circuit-breaker.ts` - External service protection
- `next.config.ts` - Security headers, CSP
- `sentry.*.config.ts` - Error tracking setup

## Deliverables Checklist

### docs/ARCHITECTURE.md
- [ ] System overview diagram (Mermaid)
- [ ] Component responsibilities
- [ ] Data flow diagrams for key features
- [ ] Technology decisions and rationale

### docs/API.md
- [ ] All 12 API endpoints documented
- [ ] Request/response schemas
- [ ] Authentication requirements
- [ ] Rate limiting details
- [ ] Error response codes

### docs/DEPLOYMENT.md
- [ ] Vercel deployment steps
- [ ] Environment variables (required vs optional)
- [ ] Supabase project setup
- [ ] Domain configuration
- [ ] CI/CD considerations

### docs/DATABASE.md
- [ ] All 11 tables documented
- [ ] Column types and constraints
- [ ] RLS policies per table
- [ ] Stored functions (match_knowledge, match_objections)
- [ ] Migration history

### docs/INTEGRATIONS.md
- [ ] VAPI setup (assistants, webhooks, signatures)
- [ ] OpenRouter configuration
- [ ] Sentry setup (client, server, edge)
- [ ] ElevenLabs voice IDs

## Open Questions

None - the codebase is well-structured and all necessary information is extractable from source files.

## Sources

### Primary (HIGH confidence)
- Codebase analysis of `/home/qualia/Desktop/Projects/voice/under/`
- `CLAUDE.md` - existing project documentation
- `src/app/api/**/*.ts` - API route implementations
- `supabase/migrations/*.sql` - database schema
- `src/lib/supabase/types.ts` - auto-generated TypeScript types

### Secondary (MEDIUM confidence)
- [Next.js Production Guide](https://nextjs.org/docs/app/guides/production-checklist) - Best practices
- [GitLab API Style Guide](https://docs.gitlab.com/development/documentation/restful_api_styleguide/) - REST API documentation patterns

### Tertiary (LOW confidence)
- Web search results for documentation patterns - verified against actual codebase structure

## Metadata

**Confidence breakdown:**
- Documentation structure: HIGH - well-established Markdown patterns
- Content extraction: HIGH - source files are clear and well-organized
- API documentation: HIGH - routes have clear schemas
- Database documentation: HIGH - migrations have SQL comments, types.ts is authoritative

**Research date:** 2026-01-25
**Valid until:** 60 days (stable content, documentation patterns don't change rapidly)
