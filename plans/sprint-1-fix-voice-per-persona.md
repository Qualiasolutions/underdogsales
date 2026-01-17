# Sprint 1: Fix Voice Per Persona

> **Priority**: P0 (Critical Bug)
> **Goal**: Each of the 6 AI personas must have their own distinct ElevenLabs voice
> **Current Bug**: All personas sound like Giulio's voice (`eCs7DikQQqNVSd0Rn5jL`)

---

## Problem Analysis

**Root Cause**: VAPI Web SDK's `start()` method doesn't support runtime voice override. The current approach:

```typescript
// src/lib/vapi/client.ts:104-109
await vapi.start(ROLEPLAY_ASSISTANT_ID, {
  voice: {
    provider: '11labs',
    voiceId: persona.voiceId,  // This override is IGNORED
    model: 'eleven_turbo_v2_5',
  },
  // ...
})
```

The assistant has a hardcoded voice that can't be changed at call time.

**Solution**: Create 6 separate VAPI assistants, one per persona, each with their correct voice pre-configured.

---

## Tasks

### Task 1: Create VAPI Assistants for Each Persona

Create 6 assistants via VAPI MCP tools with these configurations:

| Persona ID | Name | Voice ID | Voice Name |
|------------|------|----------|------------|
| skeptical_cfo | Sarah Chen - CFO | 21m00Tcm4TlvDq8ikWAM | Rachel |
| busy_vp_sales | Marcus Johnson - VP Sales | pNInz6obpgDQGcFmaJgB | Adam |
| friendly_gatekeeper | Emily Torres - EA | EXAVITQu4vr4xnSDxMaL | Bella |
| defensive_manager | David Park - Ops Mgr | TxGEqnHWrfWFTfGW9XjX | Josh |
| interested_but_stuck | Jennifer Walsh - Dir Mkt | MF3mGyEYCl7XYWbV9V6O | Elli |
| aggressive_closer | Tony Ricci - Biz Dev | yoZ06aMxZJJ28mfd3POQ | Sam |

**For each assistant:**

```json
{
  "name": "Underdog - [Persona Name]",
  "model": {
    "provider": "openai",
    "model": "gpt-4o"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "[VOICE_ID]"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-3"
  },
  "firstMessage": "[PERSONA GREETING]",
  "instructions": "[FULL ROLEPLAY PROMPT WITH PERSONA DETAILS]"
}
```

**Greetings per persona:**
- skeptical_cfo: "Yes? Who is this?"
- busy_vp_sales: "Marcus Johnson. What do you need?"
- friendly_gatekeeper: "Good morning, Nexus Enterprises, Emily speaking. How can I help you?"
- defensive_manager: "David Park speaking."
- interested_but_stuck: "Hello, this is Jennifer."
- aggressive_closer: "Yeah, who's this?"

**System prompt template** (customize persona details):
```
## YOUR IDENTITY
You are [NAME], [ROLE] at [COMPANY].

[BACKGROUND CONTEXT FROM personas.ts]

## SESSION INFO
Warmth Level: [WARMTH] (0=cold/skeptical, 1=warm/receptive)
Scenario: {{scenario_type}}
Difficulty: {{difficulty}}

## YOUR PURPOSE
You are a practice prospect for salespeople learning the Underdog cold calling methodology. Stay in character at all times.

## PERSONA BEHAVIOR
Warmth Level Interpretation:
- 0.0-0.3: Very skeptical, will try to end call quickly
- 0.3-0.5: Neutral but guarded, needs to be earned
- 0.5-0.7: Relatively open if approach is professional
- 0.7-1.0: Friendly and receptive but realistic

## OBJECTIONS TO USE
[LIST FROM personas.ts]

## GOOD TECHNIQUE (reward with engagement)
- Permission-based openers
- Problem-focused pitch (not features)
- Deep discovery (asks for examples, explores impact)
- Objection handling (pause, acknowledge, probe)
- Negative framing closes

## BAD TECHNIQUE (resist/end call)
- Feature dumps
- Pushy behavior
- Trigger words: "meeting", "demo", "calendar"
- Asking "Does that make sense?"
- Talking too much (>40%)

## SPEECH STYLE
- Natural hesitations
- Vary responses
- Interrupt if bored
- React emotionally
- Keep responses concise
```

### Task 2: Update personas.ts with Assistant IDs

After creating assistants, add their IDs to the config:

**File**: `src/config/personas.ts`

```typescript
export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  company: string;
  personality: string;
  warmth: number;
  patience: number;
  objections: string[];
  voiceId: string;
  assistantId: string;  // ADD THIS
  backgroundContext: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  skeptical_cfo: {
    // ... existing fields
    assistantId: 'NEW_ASSISTANT_ID_HERE',
  },
  // ... other personas
}
```

### Task 3: Update VAPI Client

**File**: `src/lib/vapi/client.ts`

Replace the current approach with assistant selection:

```typescript
import { PERSONAS, type PersonaId } from '@/config/personas'

export async function startRoleplaySession(options: RoleplaySessionOptions): Promise<string> {
  const vapi = getVapiClient()
  const { persona, scenarioType, onTranscript, onCallStart, onCallEnd, onError } = options

  // Clean up previous listeners
  cleanupEventListeners(vapi)

  // Register event handlers
  // ... (keep existing handler setup)

  try {
    // Use persona-specific assistant (voice is pre-configured)
    await vapi.start(persona.assistantId, {
      variableValues: {
        scenario_type: scenarioType,
        difficulty: getDifficultyFromWarmth(persona.warmth),
      },
    })

    return (vapi as unknown as { call?: { id: string } }).call?.id || 'started'
  } catch (error) {
    onError?.(error as Error)
    throw error
  }
}
```

### Task 4: Update VoicePractice Component

**File**: `src/components/voice/VoicePractice.tsx`

Remove the voice override logic since it's now handled by assistant selection:

```typescript
// Before: passed voice config
// After: just pass persona (which has assistantId)

const handleStart = useCallback(async () => {
  if (!selectedPersona || !selectedScenario) return;

  setIsConnecting(true);

  try {
    await startRoleplaySession({
      persona: selectedPersona,
      scenarioType: selectedScenario,
      onTranscript: (entry) => {
        setTranscript(prev => [...prev, entry]);
      },
      onCallStart: (callId) => {
        setIsActive(true);
        setIsConnecting(false);
        setCurrentCallId(callId);
      },
      onCallEnd: () => {
        setIsActive(false);
        onSessionEnd?.(transcript);
      },
      onError: (error) => {
        console.error('Call error:', error);
        setIsConnecting(false);
        setIsActive(false);
      },
    });
  } catch (error) {
    setIsConnecting(false);
  }
}, [selectedPersona, selectedScenario, onSessionEnd, transcript]);
```

### Task 5: Add search_knowledge Tool to Each Assistant

Each assistant needs access to the RAG knowledge base. Link the existing tool:

**Tool ID**: `5f1118ad-72c3-4db1-aec5-0d71913362fb`

When creating assistants, include:
```json
{
  "toolIds": ["5f1118ad-72c3-4db1-aec5-0d71913362fb"]
}
```

### Task 6: Test All 6 Personas

For each persona:
1. Start a practice call
2. Verify the voice is correct (distinct from others)
3. Verify greeting matches persona
4. Verify behavior matches personality (warmth level)
5. Verify objections are raised appropriately
6. Verify call ends cleanly

**Test script:**
```
1. Select Sarah Chen (CFO) -> Should hear Rachel voice, cold greeting
2. Select Marcus Johnson (VP Sales) -> Should hear Adam voice, direct greeting
3. Select Emily Torres (Gatekeeper) -> Should hear Bella voice, professional greeting
4. Select David Park (Ops Mgr) -> Should hear Josh voice, neutral greeting
5. Select Jennifer Walsh (Marketing) -> Should hear Elli voice, friendly greeting
6. Select Tony Ricci (Biz Dev) -> Should hear Sam voice, aggressive greeting
```

---

## Acceptance Criteria

- [ ] 6 VAPI assistants created (one per persona)
- [ ] Each assistant has correct ElevenLabs voice ID
- [ ] Each assistant has persona-specific system prompt
- [ ] `personas.ts` updated with assistantId field
- [ ] `vapi/client.ts` uses persona.assistantId instead of hardcoded ID
- [ ] VoicePractice component works with new approach
- [ ] All 6 personas tested and have distinct voices
- [ ] `search_knowledge` tool works for all assistants
- [ ] No regressions in call flow

---

## Files to Modify

| File | Action |
|------|--------|
| `src/config/personas.ts` | Add `assistantId` field to each persona |
| `src/lib/vapi/client.ts` | Use `persona.assistantId`, remove voice override |
| `src/components/voice/VoicePractice.tsx` | Update to work with new client |
| `src/types/index.ts` | Update `Persona` interface if needed |

---

## Commands

```bash
# After implementation, test with:
npm run dev

# Build to verify no TypeScript errors:
npm run build
```

---

## Notes

- Keep the old assistant (`45223924-49cd-43ab-8e6c-eea4c77d67c5`) as backup
- Each assistant costs the same (usage-based), so 6 assistants = same cost as 1
- Variable injection (`{{scenario_type}}`) still works for dynamic values
- Voice is baked into assistant, not changeable at runtime
