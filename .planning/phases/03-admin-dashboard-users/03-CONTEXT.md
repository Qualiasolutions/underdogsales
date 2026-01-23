# Phase 3: Admin Dashboard - Users - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin-only interface for viewing all users with their activity, and managing platform content (personas, rubric). Broad access with functional UI — no minimal permissions or restricted views.

</domain>

<decisions>
## Implementation Decisions

### Admin Access
- Hardcoded admin check (email-based or Supabase user metadata)
- Simple auth guard on /admin routes — redirect non-admins to home
- No complex role system — admin or not

### User Management
- Show all users in a table with key activity metrics
- Include: email, last active, session count, average score, joined date
- Search by email/name, basic filters (active/inactive)
- Click row to view user detail with full session history

### Content Management
- Personas: list view with expand/edit inline
- Rubric: editable form with all dimensions visible
- Changes saved to config files or database depending on architecture
- No complex versioning — simple save/update

### Claude's Discretion
- Exact table column order and styling
- Loading states and empty states
- Pagination approach (load more vs pages)
- Form validation UX
- Modal vs inline editing approach
- Mobile responsiveness depth (admin likely desktop-first)

</decisions>

<specifics>
## Specific Ideas

- "Functional with broad access" — don't hide information or limit capabilities
- Admin panel should give visibility into everything happening on the platform
- Prioritize utility over polish

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-admin-dashboard-users*
*Context gathered: 2026-01-23*
