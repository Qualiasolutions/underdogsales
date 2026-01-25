# External Integrations Guide

Complete guide for configuring external services used by the Underdog AI Sales Coach platform.

## Overview

The platform integrates with the following external services:

| Service | Purpose | Required |
|---------|---------|----------|
| **VAPI** | Voice AI for roleplay sessions | Yes |
| **OpenRouter** | LLM API for chat coaching and scoring | Yes |
| **OpenAI** | Whisper transcription for call analysis | Yes |
| **Sentry** | Error tracking and session replay | No |
| **ElevenLabs** | Voice synthesis (via VAPI) | Yes |
| **Retell** | Alternative voice platform | No |

Each service requires its own credentials. See sections below for setup instructions.

---

## VAPI (Voice AI)

VAPI powers the real-time voice roleplay sessions with AI personas.

### Account Setup

1. Go to [vapi.ai](https://vapi.ai) and create an account
2. Navigate to Dashboard > Settings > API Keys
3. Copy your Public Key and Private Key

### Environment Variables

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_...  # Used in browser
VAPI_PRIVATE_KEY=sk_...              # Used on server only
VAPI_WEBHOOK_SECRET=whsec_...        # Webhook signature verification
```

### Assistants Configuration

Each persona requires a pre-configured VAPI assistant. The following assistants are used:

| Persona | Assistant Name | Purpose | Warmth |
|---------|----------------|---------|--------|
| Sarah Chen | skeptical_cfo | CFO - ROI-focused, skeptical | 0.1 (Cold) |
| Marcus Johnson | busy_vp_sales | VP Sales - Aggressive, results-only | 0.2 (Cold) |
| Emily Torres | friendly_gatekeeper | Executive Assistant - Protective | 0.3 (Cool) |
| David Park | defensive_manager | Sales Manager - Territorial | 0.2 (Cold) |
| Lisa Martinez | interested_but_stuck | Head of Ops - Stressed, irritable | 0.4 (Neutral) |
| Tony Ricci | aggressive_closer | Sales Director - Combative | 0.15 (Cold) |

**Creating Assistants:**

1. Go to VAPI Dashboard > Assistants
2. Create new assistant for each persona
3. Configure:
   - Name: Match persona ID from `src/config/personas.ts`
   - Voice: ElevenLabs voice (see voice IDs in personas.ts)
   - System prompt: Use prompts from `PERSONA_PROMPTS` in personas.ts
   - Model: GPT-4o recommended
4. Copy the Assistant ID to `src/config/personas.ts`

### Webhook Configuration

The application receives VAPI events via webhook.

**Setup:**

1. Go to VAPI Dashboard > Webhooks
2. Add webhook endpoint:
   - URL: `https://your-domain.com/api/vapi/webhook`
   - Secret: Generate a secure secret
3. Enable all event types:
   - `call-started`
   - `call-ended`
   - `transcript`
   - `speech-update`
   - `function-call`
4. Copy the signing secret to `VAPI_WEBHOOK_SECRET`

### Signature Verification

Webhooks are verified using HMAC SHA-256. Implementation in `src/lib/vapi/auth.ts`:

```typescript
// Signature verification (production only)
const expectedSignature = crypto
  .createHmac('sha256', VAPI_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex')

// Timing-safe comparison
crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
)
```

**Note:** Signature verification is skipped in development mode for easier testing.

### Client Integration

The VAPI client is initialized in `src/lib/vapi/client.ts`:

```typescript
import Vapi from '@vapi-ai/web'

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)

// Start roleplay session
await vapi.start(persona.assistantId, {
  variableValues: {
    scenario_type: 'cold_call',
    difficulty: 'hard',
  },
})
```

---

## OpenRouter (LLM)

OpenRouter provides unified access to multiple LLM providers.

### Account Setup

1. Go to [openrouter.ai](https://openrouter.ai) and create an account
2. Navigate to Dashboard > Keys
3. Create new API key
4. Add credits to your account

### Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-...
```

### Model Configuration

The application uses the following model:

| Use Case | Model | Notes |
|----------|-------|-------|
| Chat coaching | `openai/gpt-4o` | Best quality responses |
| Call scoring | `openai/gpt-4o` | Rubric-based evaluation |

### Circuit Breaker

OpenRouter calls are protected by a circuit breaker to prevent cascading failures.

Configuration in `src/lib/circuit-breaker.ts`:

```typescript
export const openrouterCircuit = new CircuitBreaker({
  name: 'openrouter',
  failureThreshold: 5,    // Open after 5 failures
  resetTimeout: 30000,    // Try again after 30 seconds
  successThreshold: 2,    // Close after 2 successes
})
```

**States:**
- `CLOSED` - Normal operation, requests pass through
- `OPEN` - Service failing, requests blocked with error
- `HALF_OPEN` - Testing recovery, limited requests allowed

### API Usage

```typescript
const response = await openrouterCircuit.execute(() =>
  fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [...],
    }),
  })
)
```

---

## OpenAI (Whisper)

OpenAI's Whisper API transcribes uploaded call recordings.

### Account Setup

1. Go to [platform.openai.com](https://platform.openai.com) and create an account
2. Navigate to Dashboard > API Keys
3. Create new secret key
4. Add billing information

### Environment Variables

```bash
OPENAI_API_KEY=sk-...
```

### Usage Configuration

| Setting | Value |
|---------|-------|
| Model | `whisper-1` |
| Max file size | 25 MB |
| Supported formats | mp3, mp4, mpeg, mpga, m4a, wav, webm |
| Endpoint | `/api/analyze/transcribe` |

### API Integration

```typescript
const response = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  response_format: 'verbose_json',
  timestamp_granularities: ['segment'],
})
```

### Circuit Breaker

OpenAI calls are also protected:

```typescript
export const openaiCircuit = new CircuitBreaker({
  name: 'openai',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
})
```

---

## Sentry (Error Tracking)

Sentry provides error tracking, performance monitoring, and session replay.

### Account Setup

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create new project (select Next.js)
3. Copy the DSN from Project Settings

### Environment Variables

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Note:** If this variable is not set, Sentry is disabled and the app runs without error tracking.

### Configuration Files

The project includes three Sentry configuration files:

| File | Runtime | Features |
|------|---------|----------|
| `sentry.client.config.ts` | Browser | Error tracking, session replay |
| `sentry.server.config.ts` | Node.js server | Error tracking, console capture |
| `sentry.edge.config.ts` | Edge runtime | Error tracking |

### Client Configuration

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,           // 10% of transactions
  replaysSessionSampleRate: 0.1,   // 10% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% when errors occur

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
})
```

### Features Enabled

| Feature | Environment | Sample Rate |
|---------|-------------|-------------|
| Error Tracking | Production | 100% |
| Performance | Production | 10% |
| Session Replay | Production | 10% (100% on error) |
| Console Capture | Production | Errors only |

### Ignored Errors

Common non-issues are filtered out:
- Browser extension errors (`chrome-extension://`, `moz-extension://`)
- Network errors (`Network request failed`, `Failed to fetch`)
- User aborts (`AbortError`)

---

## ElevenLabs (Voice)

ElevenLabs provides voice synthesis for AI personas.

### Integration Method

ElevenLabs is integrated **via VAPI**, not directly. Voice configuration is done in VAPI assistant settings.

### Voice IDs

Each persona uses a specific ElevenLabs voice:

| Persona | Voice Name | Voice ID |
|---------|------------|----------|
| Sarah Chen | Rachel | `21m00Tcm4TlvDq8ikWAM` |
| Marcus Johnson | Adam | `pNInz6obpgDQGcFmaJgB` |
| Emily Torres | Bella | `EXAVITQu4vr4xnSDxMaL` |
| David Park | Josh | `TxGEqnHWrfWFTfGW9XjX` |
| Lisa Martinez | Elli | `MF3mGyEYCl7XYWbV9V6O` |
| Tony Ricci | Sam | `yoZ06aMxZJJ28mfd3POQ` |

### Configuration

1. Create ElevenLabs account at [elevenlabs.io](https://elevenlabs.io)
2. Note: You don't need an API key for this app
3. Voices are configured in VAPI assistant settings
4. Voice IDs are stored in `src/config/personas.ts` for reference

---

## Retell (Alternative Voice Platform)

Retell is an optional alternative to VAPI for voice roleplay.

### Account Setup

1. Go to [retellai.com](https://retellai.com) and create an account
2. Navigate to Dashboard > API Keys
3. Copy your API key

### Environment Variables

```bash
RETELL_API_KEY=key_...
```

### Feature Flag

Retell is controlled by a feature flag. When enabled, users can choose between VAPI and Retell in the voice practice interface.

### Agent Configuration

Each persona has a corresponding Retell agent ID in `src/config/personas.ts`:

```typescript
retellAgentId: 'agent_xxx...'
```

---

## Service Health

The `/api/health` endpoint checks connectivity to all external services.

### Endpoint

```bash
GET /api/health
```

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T03:17:39Z",
  "services": {
    "supabase": { "status": "healthy", "latency": 45 },
    "openai": { "status": "healthy", "latency": 120 },
    "openrouter": { "status": "healthy", "latency": 89 }
  }
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `healthy` | All services responding |
| `degraded` | Some services slow or failing |
| `unhealthy` | Critical services down |

### Circuit Breaker Status

Check circuit breaker states:

```typescript
import { openaiCircuit, openrouterCircuit } from '@/lib/circuit-breaker'

console.log(openaiCircuit.getStats())
// { state: 'closed', failures: 0, successes: 10, ... }
```

---

## Troubleshooting

### VAPI Issues

| Problem | Solution |
|---------|----------|
| Calls don't start | Check `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set |
| No audio | Verify browser microphone permissions |
| Webhook fails | Check `VAPI_WEBHOOK_SECRET` matches dashboard |
| Wrong persona voice | Update assistant voice in VAPI dashboard |

### OpenRouter Issues

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check `OPENROUTER_API_KEY` is valid |
| Rate limited | Add more credits to account |
| Circuit open | Wait 30 seconds, check logs for errors |

### OpenAI Issues

| Problem | Solution |
|---------|----------|
| Transcription fails | Check file size is under 25MB |
| 401 error | Verify `OPENAI_API_KEY` is valid |
| Slow response | Large files take longer, be patient |

### Sentry Issues

| Problem | Solution |
|---------|----------|
| No errors showing | Check `NEXT_PUBLIC_SENTRY_DSN` is set |
| No replays | Only enabled in production |
| Too much noise | Adjust `ignoreErrors` in config |

---

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide with environment variables
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design overview
- [API.md](./API.md) - API reference documentation

---

*Last updated: 2026-01-25*
