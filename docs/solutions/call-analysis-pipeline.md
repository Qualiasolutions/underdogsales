---
title: Call Analysis Pipeline
category: feature-implementation
tags: [audio, transcription, scoring, whisper, supabase-storage]
created: 2026-01-18
sprint: 4
status: complete
components:
  - src/components/analyze/*
  - src/app/api/analyze/*
  - src/lib/transcription/whisper.ts
  - src/lib/actions/call-analysis.ts
related:
  - scoring-engine
  - supabase-storage-patterns
---

# Call Analysis Pipeline

## Problem Statement

Users need to upload pre-recorded sales call recordings and receive AI-powered analysis with:
- Accurate transcription with speaker separation
- Scoring across 6 sales dimensions
- Actionable feedback with strengths/improvements

## Solution Overview

A multi-stage processing pipeline:

```
File Upload → Supabase Storage → Whisper Transcription → Scoring Engine → Results Display
     ↓              ↓                    ↓                    ↓              ↓
  Validate      Store file         Convert audio        Analyze text    Render UI
  100MB max     RLS policies       to transcript        6 dimensions    Tabs/Cards
```

## Architecture

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Upload API │────▶│  Storage    │────▶│  Database   │
│  UploadZone │     │  Validate   │     │  call-recs  │     │ call_uploads│
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐            │
│   Results   │◀────│  Score API  │◀────│ Transcribe  │◀───────────┘
│    Page     │     │   Engine    │     │   Whisper   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Status Machine

```
pending → transcribing → scoring → completed
    ↓          ↓            ↓
  failed    failed       failed
```

## Implementation Details

### 1. File Upload (`/api/analyze/upload`)

```typescript
// Validation
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a']
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

// Storage path structure for RLS
const filePath = `${user.id}/${callId}/${filename}`

// Atomic operation with cleanup
try {
  await storage.upload(filePath, buffer)
  await db.insert('call_uploads', record)
} catch (dbError) {
  await storage.remove([filePath]) // Cleanup on failure
  throw dbError
}
```

### 2. Transcription (`/api/analyze/transcribe`)

**Whisper API Integration:**
```typescript
const formData = new FormData()
formData.append('file', audioBlob, 'audio.mp3')
formData.append('model', 'whisper-1')
formData.append('response_format', 'verbose_json')
formData.append('timestamp_granularities[]', 'segment')

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
  body: formData,
})
```

**Speaker Diarization Heuristic:**
Whisper doesn't provide speaker labels. We use pause detection:

```typescript
const PAUSE_THRESHOLD_MS = 1500 // 1.5 seconds

function detectSpeakerChanges(segments: WhisperSegment[]): TranscriptEntry[] {
  let currentRole: 'user' | 'assistant' = 'assistant'

  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].start - segments[i-1].end
    if (gap > PAUSE_THRESHOLD_MS / 1000) {
      currentRole = currentRole === 'user' ? 'assistant' : 'user'
    }
  }
}
```

**Trade-offs:**
- Works well for clear turn-taking conversations
- May fail with overlapping speech or short pauses
- Alternative: Use specialized diarization service (additional cost)

### 3. Scoring (`/api/analyze/score`)

Uses existing scoring engine with 6 dimensions:

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Opener | 15% | Permission, attention, timeframe, tone |
| Pitch | 20% | Problem-focus, ICP, template, negative close |
| Discovery | 20% | Examples, impact, root cause, problem focus |
| Objection Handling | 20% | Pause, acknowledge, permission, calm |
| Closing | 15% | Summary, emotion test, negative frame, triggers |
| Communication | 10% | Talk ratio, fillers, pace, clarity |

### 4. Results Display

**Tab Interface:**
- Analysis tab: Score circle, dimension cards, feedback lists
- Transcript tab: Speaker-separated conversation view

**Components:**
- `ScoreBreakdown` - Overall score with animated circle
- `DimensionCard` - Expandable card with criteria details
- `FeedbackList` - Strengths/improvements with icons
- `TranscriptView` - Chat-style transcript display

## Database Schema

```sql
-- Migration: 003_call_uploads_status.sql
ALTER TABLE call_uploads ADD COLUMN status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'transcribing', 'scoring', 'completed', 'failed'));
ALTER TABLE call_uploads ADD COLUMN error_message TEXT;
ALTER TABLE call_uploads ADD COLUMN original_filename TEXT;

-- Indexes
CREATE INDEX idx_call_uploads_status ON call_uploads(status);
CREATE INDEX idx_call_uploads_user_status ON call_uploads(user_id, status);

-- RLS Policy
CREATE POLICY "Users can update own uploads" ON call_uploads
  FOR UPDATE USING (auth.uid() = user_id);
```

## Storage Configuration

**Bucket:** `call-recordings`
- Max file size: 100MB
- Allowed MIME types: audio/mpeg, wav, webm, ogg, m4a, mp4
- RLS: Users can only access `{user_id}/*` paths

## Security Considerations

1. **Authentication** - All routes check `getUser()` first
2. **Authorization** - RLS policies + user_id filtering
3. **File Validation** - Whitelist MIME types, size limits
4. **Error Sanitization** - Don't expose internal errors to client

## Known Limitations

1. **Speaker Diarization** - Heuristic-based, not ML-powered
2. **Long Files** - No timeout handling for Whisper API
3. **Rate Limiting** - Not implemented (TODO)
4. **Retry Logic** - No automatic retry on transient failures

## Testing Checklist

- [ ] Upload MP3, WAV, M4A files
- [ ] Reject invalid file types
- [ ] Reject files > 100MB
- [ ] Transcription produces readable text
- [ ] Speaker separation is reasonable
- [ ] Scoring matches rubric expectations
- [ ] Results display all dimensions
- [ ] Error states handled gracefully
- [ ] Mobile responsive

## Related Documentation

- [Scoring Engine](./scoring-engine.md) - Rubric and scoring logic
- [Supabase Storage Patterns](./supabase-storage-patterns.md) - RLS and bucket config

## Changelog

- **2026-01-18**: Initial implementation (Sprint 4)
