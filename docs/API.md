# Underdog AI Sales Coach - API Reference

Complete API documentation for all Next.js API routes.

**Base URL:** `https://under-eight.vercel.app` (production)

---

## Overview

### Authentication

Most endpoints require Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from Supabase client:
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

### Error Format

All errors return JSON with this structure:

```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": "Optional additional details"
}
```

### Rate Limiting

Rate limits are per-user and return headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Endpoints by Category

### Health

#### GET /api/health

Health check endpoint for monitoring. Returns status of all external services.

**Authentication:** None required

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"healthy" \| "unhealthy" \| "degraded"` | Overall system status |
| `timestamp` | `string` | ISO 8601 timestamp |
| `version` | `string` | Application version |
| `uptime` | `number` | Uptime in seconds |
| `services` | `object` | Individual service statuses |

**services object:**

| Field | Type | Description |
|-------|------|-------------|
| `supabase.status` | `"healthy" \| "unhealthy" \| "degraded"` | Database status |
| `supabase.latency` | `number` | Latency in ms |
| `openai.status` | `"healthy" \| "unhealthy" \| "degraded"` | OpenAI API status |
| `openai.latency` | `number` | Latency in ms |
| `openrouter.status` | `"healthy" \| "unhealthy" \| "degraded"` | OpenRouter API status |
| `openrouter.latency` | `number` | Latency in ms |

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T12:00:00.000Z",
  "version": "0.1.0",
  "uptime": 86400,
  "services": {
    "supabase": { "status": "healthy", "latency": 45 },
    "openai": { "status": "healthy", "latency": 120 },
    "openrouter": { "status": "healthy", "latency": 95 }
  }
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 200 | Healthy or degraded |
| 503 | One or more critical services unhealthy |

---

### Chat & Coaching

#### POST /api/chat

Chat with the AI sales coach (RAG-enhanced with Underdog methodology knowledge).

**Authentication:** Required

**Rate Limit:** 60 requests per minute

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | `Message[]` | Yes | Conversation history (1-50 messages) |
| `mode` | `string` | No | Coaching mode (see below) |

**Message object:**

| Field | Type | Description |
|-------|------|-------------|
| `role` | `"user" \| "assistant"` | Message sender |
| `content` | `string` | Message text (1-10,000 chars) |

**Mode options:**
- `curriculum` - Teach the 12 Underdog modules systematically
- `objections` - Practice objection handling (roleplay)
- `techniques` - Focus on specific techniques (openers, pitch, discovery, closing)
- `free` - Free-form coaching (default)

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | `string` | AI response |

**Example Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I handle the 'we're happy with our current solution' objection?" }
  ],
  "mode": "objections"
}
```

**Example Response:**
```json
{
  "message": "Great question! The 'happy with current solution' objection is really about complacency..."
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid input | Message validation failed |
| 401 | Authentication required | Not logged in |
| 429 | Too many messages | Rate limit exceeded |
| 503 | Service temporarily unavailable | Circuit breaker open or LLM provider down |
| 500 | Something went wrong | Internal error |

---

### Voice Practice (Retell)

#### POST /api/retell/register

Register a new voice call with Retell AI. Returns an access token for the Retell Web SDK.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agentId` | `string` | Yes | Retell agent ID from persona config |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | `string` | Token for Retell Web SDK |
| `call_id` | `string` | Unique call identifier |

**Example Request:**
```json
{
  "agentId": "agent_abc123xyz"
}
```

**Example Response:**
```json
{
  "access_token": "ret_...",
  "call_id": "call_abc123"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing agentId | Agent ID not provided |
| 401 | Unauthorized | Not logged in |
| 500 | Failed to register call | Retell API error |

---

#### POST /api/retell/webhook

Retell webhook endpoint for voice call events. Handles call lifecycle and session management.

**Authentication:** HMAC signature verification (x-retell-signature header)

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-retell-signature` | Yes | HMAC SHA-256 signature |
| `Content-Type` | Yes | `application/json` |

**Request Body:** Retell event payload (varies by event type)

**Supported Event Types:**
- `call_started` - Call initiated
- `call_ended` - Call completed (triggers session save and scoring)
- `call_analyzed` - Call analysis complete

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Invalid webhook signature | Signature verification failed |
| 500 | Webhook processing failed | Internal error |

#### GET /api/retell/webhook

Health check for Retell webhook endpoint.

**Authentication:** None

**Response:**
```json
{
  "status": "active",
  "endpoint": "/api/retell/webhook",
  "supported_events": ["call_started", "call_ended", "call_analyzed"]
}
```

---

### Knowledge Base

#### POST /api/knowledge/search

Semantic search for RAG (Retrieval-Augmented Generation). Searches Underdog methodology knowledge base using vector embeddings.

**Authentication:** Required

**Rate Limit:** 30 requests per minute

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | `string` | Yes | - | Search query (2-500 chars) |
| `source` | `string` | No | all | Filter by source |
| `limit` | `number` | No | 5 | Max results (1-10) |
| `threshold` | `number` | No | 0.5 | Similarity threshold (0.3-0.9) |

**Source options:**
- `wiki` - Underdog methodology wiki
- `persona` - AI persona definitions
- `rubric` - Scoring rubric
- `curriculum` - Curriculum modules

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `results` | `KnowledgeResult[]` | Matching knowledge chunks |
| `query` | `string` | Original query |
| `count` | `number` | Number of results |

**KnowledgeResult object:**

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | Knowledge chunk text |
| `source` | `string` | Source category |
| `source_file` | `string` | Source file name |
| `section_title` | `string` | Section heading |
| `similarity` | `number` | Similarity score (0-1) |

**Example Request:**
```json
{
  "query": "handling price objections",
  "source": "wiki",
  "limit": 3
}
```

**Example Response:**
```json
{
  "results": [
    {
      "content": "When facing price objections...",
      "source": "wiki",
      "source_file": "objection-handling.md",
      "section_title": "Price Objections",
      "similarity": 0.89
    }
  ],
  "query": "handling price objections",
  "count": 1
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Query is required | Missing or empty query |
| 401 | Unauthorized | Not logged in |
| 429 | Too many search requests | Rate limit exceeded |
| 500 | Internal server error | Processing error |

#### GET /api/knowledge/search

Documentation endpoint for knowledge search.

**Authentication:** None

**Response:**
```json
{
  "status": "ok",
  "endpoint": "/api/knowledge/search",
  "method": "POST",
  "body": {
    "query": "string (required)",
    "source": "wiki | persona | rubric | curriculum (optional)",
    "limit": "number (default: 5)",
    "threshold": "number (default: 0.7)"
  }
}
```

---

### Call Analysis

The call analysis flow consists of three steps:
1. Upload audio file
2. Transcribe with Whisper
3. Score against Underdog rubric

#### POST /api/analyze/upload

Upload an audio recording for analysis.

**Authentication:** Required

**Rate Limit:** 10 uploads per 15 minutes

**Request Body:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `File` | Yes | Audio file |

**Supported Audio Formats:**
- MP3 (`audio/mpeg`, `audio/mp3`)
- WAV (`audio/wav`, `audio/x-wav`)
- WebM (`audio/webm`)
- OGG (`audio/ogg`)
- M4A (`audio/m4a`, `audio/x-m4a`, `audio/mp4`)

**Maximum File Size:** 100MB

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Upload succeeded |
| `callId` | `string` | UUID for subsequent API calls |
| `status` | `string` | Initial status (`pending`) |
| `message` | `string` | Success message |

**Example Response:**
```json
{
  "success": true,
  "callId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "File uploaded successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | No file provided | Missing file in form data |
| 400 | Invalid file type | Unsupported audio format |
| 400 | File too large | Exceeds 100MB limit |
| 401 | Unauthorized | Not logged in |
| 429 | Too many uploads | Rate limit exceeded |
| 500 | Failed to upload file | Storage error |

---

#### POST /api/analyze/transcribe

Transcribe an uploaded audio file using OpenAI Whisper.

**Authentication:** Required

**Rate Limit:** 5 transcriptions per 15 minutes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `callId` | `string` | Yes | UUID from upload response |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Transcription succeeded |
| `callId` | `string` | Call UUID |
| `status` | `string` | New status (`scoring`) |
| `durationSeconds` | `number` | Audio duration |
| `transcriptLength` | `number` | Character count of transcript |
| `message` | `string` | Success message |

**Example Request:**
```json
{
  "callId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Response:**
```json
{
  "success": true,
  "callId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "scoring",
  "durationSeconds": 180,
  "transcriptLength": 4500,
  "message": "Transcription complete"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid call ID format | UUID validation failed |
| 400 | Call already processed | Status is `completed` |
| 400 | Transcription already in progress | Status is `transcribing` |
| 401 | Unauthorized | Not logged in |
| 404 | Call upload not found | No matching record for user |
| 429 | Too many transcription requests | Rate limit exceeded |
| 500 | Transcription failed | Whisper API error |

---

#### POST /api/analyze/score

Score a transcribed call against the Underdog methodology rubric.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `callId` | `string` | Yes | UUID from upload response |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Scoring succeeded |
| `callId` | `string` | Call UUID |
| `status` | `string` | Final status (`completed`) |
| `overallScore` | `number` | Overall score (0-10) |
| `analysis` | `CallAnalysis` | Detailed analysis |

**CallAnalysis object:**

| Field | Type | Description |
|-------|------|-------------|
| `summary` | `string` | Call summary |
| `strengths` | `string[]` | What went well |
| `improvements` | `string[]` | Areas to improve |
| `scores` | `DimensionScores` | Scores by dimension |

**DimensionScores object:**

| Dimension | Type | Description |
|-----------|------|-------------|
| `opener` | `number` | Opening quality (0-10) |
| `discovery` | `number` | Discovery quality (0-10) |
| `pitch` | `number` | Pitch effectiveness (0-10) |
| `objection_handling` | `number` | Objection handling (0-10) |
| `closing` | `number` | Closing technique (0-10) |
| `overall_flow` | `number` | Conversation flow (0-10) |

**Example Response:**
```json
{
  "success": true,
  "callId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "overallScore": 7.5,
  "analysis": {
    "summary": "Strong cold call with effective opener but weak closing...",
    "strengths": ["Pattern interrupt opener", "Good discovery questions"],
    "improvements": ["Stronger call-to-action", "Handle budget objection better"],
    "scores": {
      "opener": 8.5,
      "discovery": 7.0,
      "pitch": 7.5,
      "objection_handling": 6.5,
      "closing": 6.0,
      "overall_flow": 7.5
    }
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid call ID format | UUID validation failed |
| 400 | Call already scored | Status is `completed` |
| 400 | Call must be transcribed before scoring | Status not `scoring` |
| 400 | No transcript available | Transcript missing or empty |
| 401 | Unauthorized | Not logged in |
| 404 | Call upload not found | No matching record for user |
| 500 | Scoring failed | Scoring engine error |

---

#### GET /api/analyze/[callId]

Get details of a call analysis.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `callId` | `string` | Call UUID |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Call UUID |
| `status` | `string` | Processing status |
| `originalFilename` | `string` | Uploaded filename |
| `fileSizeBytes` | `number` | File size |
| `durationSeconds` | `number \| null` | Audio duration |
| `transcript` | `TranscriptEntry[] \| null` | Transcript data |
| `analysis` | `CallAnalysis \| null` | Analysis results |
| `overallScore` | `number \| null` | Overall score |
| `errorMessage` | `string \| null` | Error if failed |
| `createdAt` | `string` | Creation timestamp |

**Status values:**
- `pending` - Uploaded, awaiting transcription
- `transcribing` - Transcription in progress
- `scoring` - Transcribed, awaiting scoring
- `completed` - Fully analyzed
- `failed` - Processing failed

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Not logged in |
| 404 | Call upload not found | No matching record for user |
| 500 | Internal server error | Processing error |

---

#### GET /api/analyze/[callId]/stream

Stream analysis progress using Server-Sent Events (SSE).

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `callId` | `string` | Call UUID |

**Response:** `text/event-stream`

**Event Data Format:**
```json
{
  "status": "transcribing",
  "progress": 40,
  "message": "Transcribing audio with Whisper..."
}
```

**Progress Values:**

| Status | Progress | Message |
|--------|----------|---------|
| `pending` | 10 | Preparing to process... |
| `transcribing` | 40 | Transcribing audio with Whisper... |
| `scoring` | 70 | Analyzing call performance... |
| `completed` | 100 | Analysis complete! |
| `failed` | 0 | Processing failed |

**Completed Event Data:**
```json
{
  "status": "completed",
  "progress": 100,
  "message": "Analysis complete!",
  "data": {
    "overallScore": 7.5,
    "analysis": { ... }
  }
}
```

**Error Event Data:**
```json
{
  "status": "error",
  "error": "Timeout waiting for processing"
}
```

**Connection Behavior:**
- Polls database every 1 second
- Timeout after 2 minutes (120 polls)
- Closes automatically on completion or failure

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid call ID format | UUID validation failed |
| 401 | Unauthorized | Not logged in |
| 404 | Call not found | No matching record for user |

---

### User Management (GDPR)

#### POST /api/user/delete

Delete all user data (GDPR Right to Erasure / Right to be Forgotten).

Performs soft delete: data marked with `deleted_at` timestamp and retained for 90 days before hard deletion.

**Authentication:** Required

**Request Body:** None

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Deletion succeeded |
| `deletedAt` | `string` | ISO timestamp of deletion |
| `recordsAffected` | `object` | Count by record type |
| `retentionPolicy` | `object` | Retention details |

**recordsAffected object:**

| Field | Type | Description |
|-------|------|-------------|
| `roleplaySessions` | `number` | Sessions deleted |
| `sessionScores` | `number` | Scores deleted |
| `callUploads` | `number` | Uploads deleted |
| `curriculumProgress` | `number` | Progress records deleted |

**retentionPolicy object:**

| Field | Type | Description |
|-------|------|-------------|
| `softDeleteRetention` | `string` | "90 days" |
| `hardDeleteScheduled` | `string` | ISO timestamp for hard delete |

**Example Response:**
```json
{
  "success": true,
  "deletedAt": "2026-01-25T12:00:00.000Z",
  "recordsAffected": {
    "roleplaySessions": 15,
    "sessionScores": 15,
    "callUploads": 3,
    "curriculumProgress": 12
  },
  "retentionPolicy": {
    "softDeleteRetention": "90 days",
    "hardDeleteScheduled": "2026-04-25T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Not logged in |
| 500 | Failed to delete data | Database error |

#### GET /api/user/delete

Documentation endpoint for data deletion.

**Authentication:** None

**Response:**
```json
{
  "endpoint": "/api/user/delete",
  "method": "POST",
  "description": "GDPR Right to Erasure - Soft deletes all user data",
  "authentication": "Required (Supabase Auth)",
  "retention": "90 days before hard delete"
}
```

---

#### GET /api/user/export

Export all user data (GDPR Right to Data Portability).

Returns a downloadable JSON file with all user data.

**Authentication:** Required

**Response:** `application/json` (attachment download)

**Content-Disposition:** `attachment; filename="underdog-data-export-{userId}-{timestamp}.json"`

**Export Data Structure:**

| Field | Type | Description |
|-------|------|-------------|
| `exportDate` | `string` | ISO timestamp |
| `exportVersion` | `string` | Export format version |
| `user` | `object` | User profile |
| `roleplaySessions` | `array` | All practice sessions |
| `sessionScores` | `array` | All session scores |
| `callUploads` | `array` | All uploaded calls (file paths redacted) |
| `curriculumProgress` | `array` | All curriculum progress |

**Example Export:**
```json
{
  "exportDate": "2026-01-25T12:00:00.000Z",
  "exportVersion": "1.0",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "roleplaySessions": [...],
  "sessionScores": [...],
  "callUploads": [...],
  "curriculumProgress": [...]
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Not logged in |
| 500 | Failed to export data | Database error |

---

## Error Codes Reference

| Code | HTTP Status | Message |
|------|-------------|---------|
| `NETWORK_ERROR` | - | Unable to connect. Check your internet connection. |
| `TIMEOUT` | 408 | Request timed out. Please try again. |
| `CONNECTION_LOST` | - | Connection lost. Attempting to reconnect... |
| `RATE_LIMITED` | 429 | Too many requests. Please wait a moment. |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type. Use MP3, WAV, WebM, OGG, or M4A. |
| `FILE_TOO_LARGE` | 400 | File too large. Maximum size is 100MB. |
| `INVALID_INPUT` | 400 | Invalid input. Please check your data. |
| `INVALID_CALL_ID` | 400 | Invalid call ID format. |
| `UPLOAD_FAILED` | 500 | Failed to upload file. Please try again. |
| `TRANSCRIPTION_FAILED` | 500 | Failed to transcribe audio. Try a clearer recording. |
| `SCORING_FAILED` | 500 | Failed to analyze call. Please try again. |
| `PROCESSING_TIMEOUT` | 408 | Processing took too long. Please try again. |
| `UNAUTHORIZED` | 401 | Please sign in to continue. |
| `SESSION_EXPIRED` | 401 | Your session has expired. Please sign in again. |
| `NOT_FOUND` | 404 | Resource not found. |
| `ALREADY_PROCESSED` | 400 | This call has already been processed. |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable. Try again in a few minutes. |
| `INTERNAL_ERROR` | 500 | Something went wrong. Please try again. |

---

## Rate Limits Summary

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 60 requests | 1 minute |
| `/api/knowledge/search` | 30 requests | 1 minute |
| `/api/analyze/upload` | 10 requests | 15 minutes |
| `/api/analyze/transcribe` | 5 requests | 15 minutes |
| Default | 100 requests | 1 minute |

---

## Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/chat` | Yes | Chat with AI coach |
| POST | `/api/retell/register` | Yes | Register Retell call |
| POST | `/api/retell/webhook` | HMAC | Retell event webhook |
| GET | `/api/retell/webhook` | No | Webhook health check |
| POST | `/api/knowledge/search` | Yes | Semantic search |
| GET | `/api/knowledge/search` | No | Search endpoint docs |
| POST | `/api/analyze/upload` | Yes | Upload audio |
| POST | `/api/analyze/transcribe` | Yes | Transcribe audio |
| POST | `/api/analyze/score` | Yes | Score transcript |
| GET | `/api/analyze/[callId]` | Yes | Get call details |
| GET | `/api/analyze/[callId]/stream` | Yes | Stream progress (SSE) |
| POST | `/api/user/delete` | Yes | Delete user data (GDPR) |
| GET | `/api/user/delete` | No | Delete endpoint docs |
| GET | `/api/user/export` | Yes | Export user data (GDPR) |

---

*Last updated: 2026-01-25*
