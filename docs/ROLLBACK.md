# Rollback Procedures

This document outlines rollback procedures for the Underdog AI Sales Coach application.

## Vercel Deployment Rollback

### Immediate Rollback via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/qualia-solutions/under)
2. Navigate to **Deployments** tab
3. Find the last known working deployment
4. Click the three-dot menu (...) on that deployment
5. Select **Promote to Production**

### CLI Rollback

```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

### Rollback via Git

```bash
# Revert to a previous commit
git revert HEAD --no-edit
git push origin main

# Or reset to a specific commit (destructive)
git reset --hard <commit-hash>
git push origin main --force
```

## Database Migration Rollback

### Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Run the reverse migration SQL

### Manual SQL Rollback

For each migration, create a corresponding rollback script:

```sql
-- Example: Rollback soft delete columns
ALTER TABLE roleplay_sessions DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE call_uploads DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE session_scores DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE curriculum_progress DROP COLUMN IF EXISTS deleted_at;
```

### Migration Version Reset

```sql
-- Check current migration state
SELECT * FROM supabase_migrations ORDER BY version DESC LIMIT 10;

-- Delete specific migration record (allows re-running)
DELETE FROM supabase_migrations WHERE version = '005_soft_delete';
```

## Circuit Breaker Activation

If external services are failing, the circuit breaker will automatically open. To manually control:

### Force Open Circuit (Emergency Stop)

Set environment variable in Vercel:
```
CIRCUIT_BREAKER_FORCE_OPEN=true
```

This will prevent all calls to the affected service.

### Check Circuit Status

```bash
# Via API health endpoint
curl https://under-eight.vercel.app/api/health
```

## Data Recovery from Supabase

### Soft-Deleted Data Recovery

Data is soft-deleted (retained for 90 days). To recover:

```sql
-- View soft-deleted records
SELECT * FROM roleplay_sessions WHERE deleted_at IS NOT NULL;

-- Restore specific records
UPDATE roleplay_sessions SET deleted_at = NULL WHERE id = '<record-id>';
```

### Point-in-Time Recovery (PITR)

For Pro/Enterprise plans, Supabase supports PITR:

1. Go to Supabase Dashboard > Database > Backups
2. Select a point in time before the issue
3. Click **Restore to Point in Time**

**Note:** PITR restores the entire database, not individual tables.

### Manual Backup Restoration

1. Download backup from Supabase Dashboard
2. Create a new project or branch
3. Restore using `pg_restore`:

```bash
pg_restore -h <host> -U postgres -d postgres backup.dump
```

## Emergency Contacts

- **Vercel Status:** https://www.vercel-status.com/
- **Supabase Status:** https://status.supabase.com/
- **OpenRouter Status:** https://status.openrouter.ai/

## Post-Rollback Checklist

- [ ] Verify application is accessible
- [ ] Check /api/health endpoint returns healthy status
- [ ] Verify user authentication works
- [ ] Test critical paths: voice practice, call analysis, chat coaching
- [ ] Review Sentry for new errors
- [ ] Notify team of rollback and root cause
