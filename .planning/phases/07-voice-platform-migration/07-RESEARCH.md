# Phase 7: Voice Platform Migration - Research

**Researched:** 2026-01-25
**Domain:** Voice AI Platform Migration (VAPI to Retell AI)
**Confidence:** HIGH

## Summary

This research covers the migration from VAPI to Retell AI for voice practice functionality. The migration involves replacing the VAPI web SDK with Retell's client SDK, creating new Retell agents with matching personas, and implementing a new webhook endpoint for call events.

The migration is straightforward because both platforms follow similar patterns:
1. Both use web client SDKs for browser-based calls
2. Both use webhooks for server-side event handling
3. Both support ElevenLabs voices (existing voice IDs can be reused)
4. Both follow a "register call -> get access token -> start call" flow for web calls

**Primary recommendation:** Create Retell LLM response engines and agents matching existing VAPI personas, then implement Retell SDK integration following the same event-driven pattern as the current VAPI implementation.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| retell-client-js-sdk | ^2.0.7 | Web client for browser calls | Official Retell web SDK, handles WebRTC connection, audio, events |
| retell-sdk | ^4.x | Server-side API client | Official Node.js SDK for agent management, webhooks verification |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (existing) openai | ^6.x | Already installed | For LLM calls if using custom LLM option |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Retell hosted LLM | Custom LLM websocket | More control but significant complexity; hosted LLM sufficient for personas |
| ElevenLabs voices via Retell | Custom TTS provider | ElevenLabs already used in VAPI, easier migration with same voice IDs |

**Installation:**
```bash
npm install retell-client-js-sdk retell-sdk
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/retell/
│   ├── client.ts        # Web client wrapper (mirrors src/lib/vapi/client.ts)
│   ├── auth.ts          # Webhook signature verification
│   └── config.ts        # Agent IDs, environment config
├── app/api/retell/
│   ├── register/route.ts # Register web call, return access token
│   └── webhook/route.ts  # Handle call events (started, ended, analyzed)
├── config/
│   └── personas.ts       # Add retellAgentId alongside assistantId
└── components/voice/
    └── VoicePractice.tsx # Toggle between VAPI/Retell clients
```

### Pattern 1: Web Call Flow (Server + Client)

**What:** Secure web call initiation requiring server-side registration.

**When to use:** All web-based voice calls (not phone calls).

**Server-side (register call):**
```typescript
// Source: https://docs.retellai.com/api-references/create-web-call
import Retell from 'retell-sdk';

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY! });

export async function registerWebCall(agentId: string, metadata?: Record<string, unknown>) {
  const response = await retell.call.createWebCall({
    agent_id: agentId,
    metadata,
    retell_llm_dynamic_variables: {
      scenario_type: metadata?.scenarioType || 'cold_call',
    },
  });

  return {
    accessToken: response.access_token,
    callId: response.call_id,
  };
}
```

**Client-side (start call):**
```typescript
// Source: https://docs.retellai.com/deploy/web-call
import { RetellWebClient } from 'retell-client-js-sdk';

const retellWebClient = new RetellWebClient();

// Event handlers
retellWebClient.on('call_started', () => onCallStart?.());
retellWebClient.on('call_ended', () => onCallEnd?.());
retellWebClient.on('update', (update) => {
  // update.transcript contains last 5 sentences
  onTranscript?.(update.transcript);
});
retellWebClient.on('error', (error) => onError?.(error));

// Start call with access token from server
await retellWebClient.startCall({
  accessToken: accessToken,
  sampleRate: 24000,
});

// Stop call
retellWebClient.stopCall();

// Mute/unmute
retellWebClient.mute();
retellWebClient.unmute();
```

### Pattern 2: Webhook Handler

**What:** Server-side event processing for call lifecycle.

**When to use:** Handling call_started, call_ended, call_analyzed events.

**Example:**
```typescript
// Source: https://docs.retellai.com/features/webhook
import Retell from 'retell-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-retell-signature');

  // Verify signature
  const isValid = Retell.verify(
    rawBody,
    signature || '',
    process.env.RETELL_API_KEY!
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { event, call } = payload;

  switch (event) {
    case 'call_started':
      console.log('Call started:', call.call_id);
      break;
    case 'call_ended':
      // call.transcript available here
      await saveSession(call);
      break;
    case 'call_analyzed':
      // call.analysis available (post-call analysis)
      break;
  }

  return new NextResponse(null, { status: 204 });
}
```

### Pattern 3: Agent Configuration with Retell LLM

**What:** Creating agents with hosted LLM response engine.

**When to use:** Setting up persona-specific agents with prompts.

**Example:**
```typescript
// Source: https://docs.retellai.com/api-references/create-retell-llm
// https://docs.retellai.com/api-references/create-agent

// Step 1: Create Retell LLM (response engine)
const llm = await retell.llm.create({
  general_prompt: `## YOUR IDENTITY
You are Sarah Chen, CFO. You're 47, Wharton MBA, ex-Deloitte...
[full persona prompt from personas.ts]`,
  begin_message: "Yes?",
  model: 'gpt-4.1',
  model_temperature: 0.7,
  general_tools: [
    {
      type: 'end_call',
      name: 'end_roleplay',
      description: 'End the call when the conversation naturally concludes',
    }
  ],
});

// Step 2: Create Agent with the LLM
const agent = await retell.agent.create({
  response_engine: {
    type: 'retell-llm',
    llm_id: llm.llm_id,
  },
  voice_id: '11labs-Rachel', // or ElevenLabs voice ID directly
  agent_name: 'Sarah Chen (CFO)',
  language: 'en-US',
  interruption_sensitivity: 0.8,
  enable_backchannel: true,
});
```

### Anti-Patterns to Avoid

- **Exposing API key client-side:** NEVER call create-web-call from browser. Always route through server endpoint.
- **Not verifying webhooks:** Always verify x-retell-signature header using Retell.verify().
- **Starting call without access token:** Must call server endpoint to get access token first.
- **Ignoring 30-second token expiry:** Access tokens expire in 30s. Start call immediately after receiving token.
- **Missing error event handler:** Always handle 'error' events to surface connection issues to users.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebRTC audio handling | Custom WebRTC implementation | retell-client-js-sdk | SDK handles all WebRTC, audio capture, playback |
| Webhook signature verification | Custom HMAC verification | Retell.verify() | SDK provides verified implementation |
| Voice synthesis | Direct ElevenLabs API | Retell-managed voices | Retell handles TTS pipeline, latency optimization |
| Reconnection logic | Custom reconnect handler | Built-in SDK reconnection | SDK handles disconnect/reconnect automatically |

**Key insight:** Retell's SDK abstracts all real-time audio/WebRTC complexity. The migration is mostly configuration and API endpoint changes, not rebuilding voice infrastructure.

## Common Pitfalls

### Pitfall 1: Access Token Expiry
**What goes wrong:** Call fails to start with cryptic error.
**Why it happens:** Access tokens expire 30 seconds after creation.
**How to avoid:** Register call immediately before starting, don't cache tokens.
**Warning signs:** "invalid access token" or call status shows "error".

### Pitfall 2: Missing Webhook URL Configuration
**What goes wrong:** No server-side events received after calls.
**Why it happens:** Agent webhook_url not configured in Retell dashboard or agent creation.
**How to avoid:** Set webhook_url when creating agents or in Retell dashboard.
**Warning signs:** Calls work but no server-side logging/session saving.

### Pitfall 3: Transcript Accumulation
**What goes wrong:** Incomplete transcript at call end.
**Why it happens:** Retell 'update' event only contains last 5 sentences to reduce payload.
**How to avoid:** Accumulate transcript entries in client state, or use webhook call_ended which has full transcript.
**Warning signs:** Missing early parts of conversation in saved transcripts.

### Pitfall 4: ElevenLabs Voice ID Format
**What goes wrong:** Voice not found or wrong voice used.
**Why it happens:** Retell uses prefixed format like "11labs-Rachel" for built-in voices.
**How to avoid:** For custom ElevenLabs voices, use raw voice ID directly. For Retell presets, use the prefixed format.
**Warning signs:** Agent uses default voice instead of expected one.

### Pitfall 5: Serverless Function Timeout
**What goes wrong:** Webhook handler times out or disconnects.
**Why it happens:** Vercel/serverless functions have timeout limits.
**How to avoid:** Keep webhook handler lightweight (log + quick DB write). Process heavy work async.
**Warning signs:** Webhook returns 504 or partial data saved.

## Code Examples

### Complete Client Implementation

```typescript
// src/lib/retell/client.ts
// Source: https://docs.retellai.com/deploy/web-call
import { RetellWebClient } from 'retell-client-js-sdk';
import type { Persona, TranscriptEntry } from '@/types';

let retellInstance: RetellWebClient | null = null;

export function getRetellClient(): RetellWebClient {
  if (!retellInstance) {
    retellInstance = new RetellWebClient();
  }
  return retellInstance;
}

export interface RetellSessionOptions {
  persona: Persona;
  scenarioType: 'cold_call' | 'objection' | 'closing' | 'gatekeeper';
  onTranscript?: (entry: TranscriptEntry) => void;
  onCallStart?: (callId: string) => void;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
}

export async function startRetellSession(options: RetellSessionOptions): Promise<string> {
  const { persona, scenarioType, onTranscript, onCallStart, onCallEnd, onError } = options;

  // Register call via server endpoint
  const response = await fetch('/api/retell/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: persona.retellAgentId, // New field in Persona type
      metadata: { personaId: persona.id, scenarioType },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to register call');
  }

  const { accessToken, callId } = await response.json();

  const retell = getRetellClient();

  // Set up event handlers
  retell.on('call_started', () => onCallStart?.(callId));
  retell.on('call_ended', () => onCallEnd?.());
  retell.on('update', (update) => {
    // Process transcript updates
    if (update.transcript) {
      onTranscript?.({
        role: update.role || 'assistant',
        content: update.transcript,
        timestamp: Date.now(),
      });
    }
  });
  retell.on('error', (error) => onError?.(new Error(error.message || 'Call failed')));

  // Start the call
  await retell.startCall({ accessToken });

  return callId;
}

export function stopRetellSession(): void {
  const retell = getRetellClient();
  retell.stopCall();
}

export function muteRetellSession(muted: boolean): void {
  const retell = getRetellClient();
  if (muted) {
    retell.mute();
  } else {
    retell.unmute();
  }
}
```

### Register Endpoint

```typescript
// src/app/api/retell/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createClient } from '@/lib/supabase/server';

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY! });

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentId, metadata } = await request.json();

  if (!agentId) {
    return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  }

  try {
    const response = await retell.call.createWebCall({
      agent_id: agentId,
      metadata: {
        ...metadata,
        userId: user.id,
      },
    });

    return NextResponse.json({
      accessToken: response.access_token,
      callId: response.call_id,
    });
  } catch (error) {
    console.error('Failed to register Retell call:', error);
    return NextResponse.json(
      { error: 'Failed to register call' },
      { status: 500 }
    );
  }
}
```

### Webhook Handler

```typescript
// src/app/api/retell/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-retell-signature');

  // Verify webhook signature
  const isValid = Retell.verify(
    rawBody,
    signature || '',
    process.env.RETELL_API_KEY!
  );

  if (!isValid) {
    logger.warn('Retell webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { event, call } = payload;

  logger.debug('Retell webhook received', { event, callId: call?.call_id });

  switch (event) {
    case 'call_started':
      logger.info('Retell call started', { callId: call.call_id });
      break;

    case 'call_ended':
      logger.info('Retell call ended', {
        callId: call.call_id,
        duration: call.end_timestamp - call.start_timestamp,
        disconnectionReason: call.disconnection_reason,
      });
      // Note: Full session saving happens client-side
      break;

    case 'call_analyzed':
      logger.info('Retell call analyzed', {
        callId: call.call_id,
        hasAnalysis: !!call.analysis,
      });
      break;
  }

  return new NextResponse(null, { status: 204 });
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/retell/webhook',
    supported_events: ['call_started', 'call_ended', 'call_analyzed'],
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebSocket-based calls | WebRTC infrastructure | 2024 | Better latency, reliability, built-in reconnection |
| llm_websocket_url field | response_engine field | 2024 | Cleaner API, deprecated old field |
| Manual LLM integration | Retell-hosted LLM | 2024 | Simpler setup, managed model selection |

**Deprecated/outdated:**
- `llm_websocket_url`: Use `response_engine` with `type: 'retell-llm'` instead
- `startConversation(callId)`: Old SDK method, now use `startCall({ accessToken })`

## Open Questions

1. **Voice ID Mapping**
   - What we know: Retell supports ElevenLabs voices with prefix "11labs-" or raw voice IDs
   - What's unclear: Whether existing ElevenLabs voice IDs from VAPI (e.g., "21m00Tcm4TlvDq8ikWAM") work directly in Retell
   - Recommendation: Test one voice ID first before creating all agents; may need to re-add voices in Retell dashboard

2. **Feature Flag Implementation**
   - What we know: Need to toggle VAPI/Retell during migration
   - What's unclear: Best approach - environment variable, database flag, or user preference
   - Recommendation: Use environment variable `VOICE_PROVIDER=vapi|retell` for simplicity, can enhance later

3. **Giulio Coach Agent**
   - What we know: Need to create coach agent matching existing VAPI assistant
   - What's unclear: Current Giulio assistant prompt/configuration not in codebase (configured in VAPI dashboard)
   - Recommendation: Export Giulio assistant config from VAPI dashboard before creating Retell equivalent

## Sources

### Primary (HIGH confidence)
- [Retell SDK Documentation](https://docs.retellai.com/get-started/sdk) - SDK installation, initialization
- [Retell Web Call Guide](https://docs.retellai.com/deploy/web-call) - Web client usage, events
- [Retell Webhook Documentation](https://docs.retellai.com/features/webhook) - Event types, signature verification
- [Create Agent API](https://docs.retellai.com/api-references/create-agent) - Agent configuration parameters
- [Create Retell LLM API](https://docs.retellai.com/api-references/create-retell-llm) - Response engine configuration
- [Create Web Call API](https://docs.retellai.com/api-references/create-web-call) - Access token generation
- [retell-client-js-sdk GitHub](https://github.com/RetellAI/retell-client-js-sdk) - TypeScript interfaces, methods

### Secondary (MEDIUM confidence)
- [Retell vs VAPI Comparison](https://www.retellai.com/blog/retell-vs-vapi) - Platform differences, pricing
- [Retell Frontend React Demo](https://github.com/RetellAI/retell-frontend-reactjs-demo) - Reference implementation

### Tertiary (LOW confidence)
- Pricing estimates (~$0.07/min vs $0.15-0.20/min) - May vary based on actual usage and plan

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Retell documentation and SDK sources
- Architecture: HIGH - Patterns verified against official docs and demos
- Pitfalls: MEDIUM - Combination of docs and community reports

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable platform, well-documented)
