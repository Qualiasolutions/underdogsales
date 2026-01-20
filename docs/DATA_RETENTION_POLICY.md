# Data Retention Policy

This document outlines the data retention policies for the Underdog AI Sales Coach platform.

## Overview

Underdog AI follows a data minimization approach, retaining user data only as long as necessary to provide our services and comply with legal requirements.

## Retention Periods by Data Type

### User Account Data

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Email, Name | Account lifetime + 30 days | Deleted after account closure |
| Authentication tokens | Session-based | Cleared on logout |
| Organization membership | Account lifetime | Cascades with account deletion |

### Roleplay Sessions

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Session metadata | 1 year active | Soft deleted after user deletion |
| Voice call recordings | Not stored | Processed in real-time only |
| Session transcripts | 1 year active | Stored as JSON in database |
| Session scores | 1 year active | Linked to sessions |

### Call Analysis Uploads

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Audio files | 90 days | Stored in Supabase Storage |
| Transcripts | 1 year | Stored in database |
| Analysis results | 1 year | Stored in database |

### Curriculum Progress

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Module completion | Account lifetime | Soft deleted with account |
| Quiz scores | Account lifetime | Soft deleted with account |

### Audit Logs

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Security audit logs | 3 years | Required for compliance |
| API access logs | 90 days | Stored in Vercel/Sentry |
| Error logs | 30 days | Stored in Sentry |

## Soft Delete Policy

User data undergoes a two-stage deletion process:

### Stage 1: Soft Delete (Immediate)

When a user requests deletion:
- `deleted_at` timestamp is set on all user records
- Data becomes inaccessible through normal queries
- User can no longer access their data
- Data remains for recovery purposes

### Stage 2: Hard Delete (90 Days)

After 90 days from soft delete:
- All soft-deleted records are permanently removed
- Associated files in storage are purged
- No recovery is possible after this point

## Exceptions

### Legal Hold

Data may be retained beyond normal periods if:
- Required by law enforcement
- Subject to legal proceedings
- Part of regulatory investigation

### Aggregated Analytics

Anonymized, aggregated data may be retained indefinitely for:
- Platform improvement
- Usage analytics
- Performance benchmarking

This data cannot be traced back to individual users.

## User Rights

### Right to Access (GDPR Article 15)

Users can export all their data via:
```
GET /api/user/export
```

### Right to Erasure (GDPR Article 17)

Users can request data deletion via:
```
POST /api/user/delete
```

### Right to Portability (GDPR Article 20)

Data is exported in standard JSON format, including:
- Roleplay sessions
- Session scores
- Call uploads (metadata only)
- Curriculum progress

## Implementation Details

### Database Tables with Soft Delete

- `roleplay_sessions` - `deleted_at` column
- `call_uploads` - `deleted_at` column
- `session_scores` - `deleted_at` column
- `curriculum_progress` - `deleted_at` column

### RLS Policies

Row-Level Security policies automatically filter soft-deleted records:

```sql
CREATE POLICY "Users can view their own sessions" ON roleplay_sessions
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

### Storage Cleanup

Audio files are cleaned up via scheduled job after associated `call_uploads` record hard delete.

## Contact

For data retention inquiries, contact: privacy@qualia-solutions.com
