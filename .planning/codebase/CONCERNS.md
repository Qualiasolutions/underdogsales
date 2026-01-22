# Codebase Concerns

**Analysis Date:** 2025-01-23

## Tech Debt

**In-Memory Rate Limiter:**
- Issue: Rate limiting uses in-memory Map that resets on server restart. No persistence across replicas in production.
- Files: `src/lib/rate-limit.ts`
- Impact: Rate limits bypass on deployments, preventing proper API abuse protection across scaled instances
- Fix approach: Migrate to Redis/Upstash for distributed rate limiting. The current implementation has a comment noting this (`For production scale, consider using Redis or Upstash`)

**Speaker Diarization (Transcript Fallback):**
- Issue: OpenAI Whisper API doesn't provide speaker diarization. Current implementation uses pause-based heuristic to alternate between user/assistant roles.
- Files: `src/lib/transcription/whisper.ts` (lines 82-92, 98-164)
- Impact: Scoring engine receives incorrectly labeled speaker roles, leading to inaccurate analysis. Opener analysis scores based on first user message, which may actually be the prospect.
- Fix approach: Implement real speaker diarization via pyannote.audio or use Deepgram (already integrated via VAPI) for transcription instead of Whisper. Deepgram has built-in diarization.

**Type Safety Gaps:**
- Issue: 16 instances of `as unknown as`, `as any`, or `: any` type assertions throughout codebase
- Files:
  - `src/lib/knowledge.ts` line 64 (map with `any`)
  - `src/lib/actions/practice-session.ts` line 97 (transcript as unknown as Json)
  - `src/lib/actions/call-analysis.ts` lines 21-22 (transcript/analysis unknowns)
  - `src/lib/actions/curriculum.ts` lines 31-32, 58-59, 78, 127 (eslint-disable @typescript-eslint/no-explicit-any)
  - `src/lib/vapi/client.ts` line 61 (vapi as unknown)
- Impact: Type safety illusion - compiler won't catch runtime errors in these paths. Example: knowledge search maps items with `any` type.
- Fix approach: Define proper TypeScript interfaces for all Supabase RPC return types. Create strict types for VAPI client state.

**Circuit Breaker State Not Persisted:**
- Issue: CircuitBreaker state (open/closed) lives only in memory. No sharing across instances or recovery tracking.
- Files: `src/lib/circuit-breaker.ts`
- Impact: Horizontal scaling creates multiple independent circuit breakers. When one instance trips, others continue sending traffic to failing service.
- Fix approach: Implement distributed circuit breaker state using Redis or simple shared state tracking (log which services are degraded to health check).

---

## Known Bugs

**Transcript Role Attribution Unreliable:**
- Symptoms: Practice session scoring produces inconsistent results because speaker roles are misidentified
- Files: `src/lib/transcription/whisper.ts` lines 98-164 (convertToTranscriptEntries)
- Trigger: Any audio with variable pause lengths or multiple people speaking
- Workaround: None - affects all call uploads that don't use VAPI (which provides transcript directly)

**Missing Async/Await in Cleanup Intervals:**
- Symptoms: Rate limit store cleanup runs indefinitely every 5 minutes with no cancellation mechanism
- Files: `src/lib/rate-limit.ts` lines 24-36 (scheduleCleanup)
- Trigger: Any production deployment where cleanup interval runs on every instance simultaneously
- Workaround: None - cleanup happens but isn't optimized for horizontal scaling

---

## Security Considerations

**Unencrypted Audio Storage:**
- Risk: Call recordings stored in Supabase Storage without encryption at rest (depends on Supabase configuration)
- Files: `src/app/api/analyze/upload/route.ts` lines 76-80 (upload to storage)
- Current mitigation: Supabase Storage has RLS policies, storage is private by default. User ID-based path isolation.
- Recommendations: Verify Supabase Storage encryption settings are enabled. Consider encrypting audio before upload in sensitive environments. Add audit logging for all storage access.

**VAPI Webhook Signature Verification:**
- Risk: Webhook signature validation is HMAC SHA-256, only as secure as the webhook secret
- Files: `src/app/api/vapi/webhook/route.ts` lines 54-64
- Current mitigation: Verification implemented via `verifyVapiSignature`. Secret stored in env vars.
- Recommendations: Ensure webhook secret never logged. Implement webhook request signing verification with timestamp validation to prevent replay attacks.

**Admin Client Elevation Without Explicit User Authorization:**
- Risk: Several API routes use admin client (bypasses RLS) with only initial user existence check
- Files:
  - `src/app/api/analyze/score/route.ts` (line 30 uses admin client)
  - `src/app/api/analyze/[callId]/stream/route.ts` (line 43 uses admin client)
  - `src/app/api/knowledge/search/route.ts` (admin client for embeddings)
- Current mitigation: User ID verified before operation, RLS policies on tables
- Recommendations: Document why admin client is needed for each endpoint. Add explicit authorization checks. Log all admin client operations.

**Rate Limiting Uses User ID as Sole Identifier:**
- Risk: User ID enumeration possible if predictable
- Files: `src/lib/rate-limit.ts` line 31 (uses `upload:${user.id}`)
- Current mitigation: Rate limiting enforced per-user
- Recommendations: Add IP-based fallback rate limiting. Hash user ID for key generation.

---

## Performance Bottlenecks

**Large Component Bundle - VoicePractice.tsx:**
- Problem: 887 lines in single component, including nested components (VoiceVisualizer, ConnectionIndicator, TranscriptMessage, ErrorMessage) defined inline
- Files: `src/components/voice/VoicePractice.tsx`
- Cause: Multiple useState calls (line 234-245), useRef for DOM/data access, complex conditional rendering, animation logic
- Improvement path: Extract nested components to separate files. Extract state management to custom hook. Consider useReducer for complex state transitions.

**Scoring Engine Full Text Processing:**
- Problem: `analyzeTranscript` performs 6 different text analysis passes (opener, pitch, discovery, objection, closing, communication) on the same transcript
- Files: `src/lib/scoring/engine.ts` lines 18-55
- Cause: Each dimension analysis repeats full text joins and lowercase operations
- Improvement path: Pre-compute lowercase text and word counts once. Use single regex pass for all phrase detection instead of multiple `.some()` calls per dimension.

**Knowledge Base Search Creates New OpenAI Client Instance:**
- Problem: `searchKnowledgeBase` creates new OpenAI client on every call (line 34-37)
- Files: `src/lib/knowledge.ts` lines 34-37
- Cause: Client instantiation overhead per request
- Improvement path: Create singleton OpenAI instance (similar to Supabase admin client pattern). Reuse across requests.

**N+1 Session Score Queries Partially Fixed:**
- Problem: Comment at line 155 of `src/lib/actions/practice-session.ts` says "Get session with scores in single query (fixes N+1)" but implementation may still perform multiple queries
- Files: `src/lib/actions/practice-session.ts` line 155
- Cause: Unclear if select statement fully joins related session_scores data
- Improvement path: Verify query includes full eager loading of related scores. Add query logging to confirm single query execution.

---

## Fragile Areas

**VoiceCoach Component State Management:**
- Files: `src/components/voice/VoiceCoach.tsx` (694 lines)
- Why fragile: Multiple useState hooks managing VAPI connection state, transcript, messages, loading states. Line 279 contains type assertion on VAPI client object (`as unknown as { call?: { id: string } }`). No explicit state synchronization between component and VAPI client.
- Safe modification: Extract VAPI state into custom hook. Use useCallback to prevent stale closures. Add explicit state guards before mutations.
- Test coverage: Limited - no unit tests visible for state transitions

**CallAnalyzer Component SSE Polling:**
- Files: `src/components/analyze/CallAnalyzer.tsx` (392 lines)
- Why fragile: Implements dual streaming pattern (SSE with fallback to polling, lines 66-84). Timeout-based polling (line 52 sets 500ms timeout) may miss state transitions. Manual error handling with console.error calls instead of structured error boundary.
- Safe modification: Consolidate to single streaming strategy. Add explicit retry limits. Replace console.error with error boundary context.
- Test coverage: No tests for streaming failure scenarios

**Whisper Transcript Conversion Heuristic:**
- Files: `src/lib/transcription/whisper.ts` lines 98-164
- Why fragile: Speaker role detection uses simple pause heuristic: if pause > 0.7s, assume speaker change. This breaks with natural pauses within sentences or rapid back-and-forth dialogue.
- Safe modification: Add configurable pause threshold. Log all speaker transitions for debugging. Add fallback that detects silence vs actual speech to refine heuristic.
- Test coverage: No unit tests for convertToTranscriptEntries function

**Error Handling Silent Failures:**
- Files: Multiple locations return empty arrays/null on error:
  - `src/lib/actions/practice-session.ts` lines 151, 180, 263, 282, 301, 321
  - `src/lib/actions/call-analysis.ts` lines 33, 44
  - `src/lib/knowledge.ts` lines 29, 75
- Why fragile: Errors are logged but caller receives no distinction between "no results" and "failed to fetch". UI shows empty state instead of error state.
- Safe modification: Return Result<T, Error> pattern or throw instead of swallowing. Pass error context to caller.
- Test coverage: No tests for error paths

---

## Scaling Limits

**In-Memory Rate Limit Store:**
- Current capacity: Limited by instance RAM. No hard limit enforced.
- Limit: Each Map entry ~200 bytes. With 10k active users, ~2MB RAM. On horizontal scaling, no cross-instance sharing.
- Scaling path: Replace with Redis (0-2ms latency). Use sliding window algorithm. Implement per-tier rate limits (free vs paid).

**Circuit Breaker Memory per Service:**
- Current capacity: 4 circuit breakers (openai, openrouter, vapi, supabase) × ~500 bytes = 2KB total
- Limit: Not a capacity issue. Issue is each instance maintains independent state. No visibility into global service health.
- Scaling path: Implement shared circuit breaker state. Log circuit state changes to observability backend (Sentry already integrated). Add global service health dashboard.

**VAPI Concurrent Calls per Instance:**
- Current capacity: Depends on Node.js worker threads. Default ~500 concurrent connections.
- Limit: Each VAPI call WebSocket consumes 1 connection. File upload/transcription adds 2 more. At scale, connections exhaust.
- Scaling path: Implement connection pooling. Use worker threads for I/O. Separate voice call endpoints to dedicated instance.

---

## Dependencies at Risk

**OpenAI/Whisper as Sole Transcription Provider (Call Uploads):**
- Risk: OpenAI API outages block call upload analysis. No fallback when OpenAI unavailable.
- Impact: Users can't upload/analyze recorded calls. VAPI calls work (use Deepgram) but uploads don't.
- Migration plan: Already integrated Deepgram via VAPI. Implement Deepgram as primary transcription provider for uploads. Keep OpenAI as fallback.

**No Fallback for LLM Provider Failure:**
- Risk: Score generation fails silently when LLM unavailable (OpenRouter or OpenAI)
- Impact: Analysis_results show no scores, users see incomplete feedback
- Migration plan: Implement rule-based scoring as fallback (already have `analyzeTranscript` for rule-based approach in engine.ts). Use only for LLM-dependent features (summary generation). Rule-based scores sufficient for MVP.

---

## Missing Critical Features

**No Concurrent Call Upload Safety:**
- Problem: User can upload multiple files simultaneously with no deduplication or conflict detection
- Blocks: Users can't resume interrupted uploads. No progress tracking for multi-file scenarios.

**Speaker Diarization Unsupported in Whisper Path:**
- Problem: Call upload transcription can't distinguish speaker roles reliably
- Blocks: Scoring accuracy suffers. Can't provide speaker-specific feedback.

**No Request Signing/HMAC Validation for Health Check:**
- Problem: Health check endpoint exposed at `/api/health` with no authentication
- Blocks: Can't publish health check URL without exposing service status to unauthenticated users

---

## Test Coverage Gaps

**Scoring Engine Edge Cases:**
- What's not tested:
  - Empty transcript handling
  - Single-speaker transcript
  - Transcripts with no matching criteria phrases
  - Talks ratio calculation with zero word count
- Files: `src/lib/scoring/engine.ts`
- Risk: Scoring produces inconsistent results on edge cases. Could cause NaN scores or crashes.
- Priority: High - scoring is core feature

**VAPI Webhook Processing:**
- What's not tested:
  - Invalid signature handling
  - Malformed JSON payloads
  - Missing metadata fields
  - Concurrent webhook calls
- Files: `src/app/api/vapi/webhook/route.ts`
- Risk: Webhook processing can crash and drop events
- Priority: High - webhook is critical for call recording

**Circuit Breaker Failover:**
- What's not tested:
  - State transitions (closed → open → half-open → closed)
  - Success threshold for reopening
  - Concurrent requests during half-open state
  - Manual reset behavior
- Files: `src/lib/circuit-breaker.ts`
- Risk: Circuit breaker may not prevent cascading failures or may fail to recover
- Priority: Medium - affects reliability but has fallback error handling

**Authentication & Authorization:**
- What's not tested:
  - User can access only their own sessions
  - Admin client elevation is gated
  - Rate limits are enforced per-user
  - Soft delete doesn't expose deleted_at to users
- Files: Multiple API routes
- Risk: Authorization bypass could expose user data
- Priority: High - security critical

---

*Concerns audit: 2025-01-23*
