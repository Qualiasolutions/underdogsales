# External Integrations Guide

Complete guide for configuring external services used by the Underdog AI Sales Coach platform.

## Overview

The platform integrates with the following external services:

| Service | Purpose | Required |
|---------|---------|----------|
| **Retell AI** | Voice AI for roleplay sessions | Yes |
| **OpenRouter** | LLM API for chat coaching and scoring | Yes |
| **OpenAI** | Whisper transcription for call analysis | Yes |
| **Sentry** | Error tracking and session replay | No |
| **ElevenLabs** | Voice synthesis (via Retell) | Yes |

Each service requires its own credentials. See sections below for setup instructions.

---

## Retell AI (Voice Platform)

Retell AI powers the real-time voice roleplay sessions with AI personas.

### Account Setup

1. Go to [retellai.com](https://retellai.com) and create an account
2. Navigate to Dashboard > API Keys
3. Copy your API key

### Environment Variables

```bash
RETELL_API_KEY=key_...  # Server-side API key
```

### Agent Configuration

Each persona has a corresponding Retell agent. The following agents are configured:

| Persona | Agent Name | Purpose | Warmth |
|---------|------------|---------|--------|
| Giulio Segantini | Underdog Sales Coach | Sales coach | N/A |
| Sarah Chen | skeptical_cfo | CFO - ROI-focused, skeptical | 0.1 (Cold) |
| Marcus Johnson | busy_vp_sales | VP Sales - Aggressive, results-only | 0.2 (Cold) |
| Emily Torres | friendly_gatekeeper | Executive Assistant - Protective | 0.3 (Cool) |
| David Park | defensive_manager | Sales Manager - Territorial | 0.2 (Cold) |
| Lisa Martinez | interested_but_stuck | Head of Ops - Stressed, irritable | 0.4 (Neutral) |
| Tony Ricci | aggressive_closer | Sales Director - Combative | 0.15 (Cold) |

**Creating Agents:**

1. Go to Retell Dashboard > Agents
2. Create new agent for each persona
3. Configure:
   - Name: Match persona from `src/config/personas.ts`
   - Voice: Select ElevenLabs voice
   - LLM: Custom LLM with persona prompts from `PERSONA_PROMPTS`
   - Model: GPT-4o recommended
4. Copy the Agent ID to `src/config/personas.ts` (`retellAgentId` field)

### Webhook Configuration

The application receives Retell events via webhook.

**Setup:**

1. Go to Retell Dashboard > Webhooks
2. Add webhook endpoint:
   - URL: `https://your-domain.com/api/retell/webhook`
3. Events handled:
   - `call_started`
   - `call_ended`
   - `call_analyzed`

### Client Integration

Voice calls are registered via the `/api/retell/register` endpoint, which returns an access token for the Retell Web SDK:

```typescript
import { RetellWebClient } from 'retell-client-js-sdk'

// Register call and get access token
const response = await fetch('/api/retell/register', {
  method: 'POST',
  body: JSON.stringify({ agentId: persona.retellAgentId }),
})
const { access_token } = await response.json()

// Start the call
const retellClient = new RetellWebClient()
await retellClient.startCall({ accessToken: access_token })
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

ElevenLabs is integrated **via Retell AI**, not directly. Voice configuration is done in Retell agent settings.

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
3. Voices are configured in Retell agent settings
4. Voice IDs are stored in `src/config/personas.ts` for reference

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

### Retell Issues

| Problem | Solution |
|---------|----------|
| Calls don't start | Check `RETELL_API_KEY` is set |
| No audio | Verify browser microphone permissions |
| Webhook fails | Check webhook URL in Retell dashboard |
| Wrong persona voice | Update agent voice in Retell dashboard |

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
