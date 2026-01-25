# Requirements: Underdog AI Sales Coach

**Defined:** 2026-01-23
**Core Value:** Salespeople can practice and improve their skills through realistic AI-powered conversations with immediate, actionable feedback.

## v1 Requirements

Requirements for MVP release (~13/03/2026). Each maps to roadmap phases.

### User Dashboard

- [x] **DASH-01**: User can view list of past practice sessions with date, persona, and score
- [x] **DASH-02**: User can see curriculum progress with completed/total modules
- [x] **DASH-03**: User can view history of uploaded call analyses with scores
- [x] **DASH-04**: User can see performance trends (score improvements over time)

### Admin Dashboard

- [x] **ADMIN-01**: Admin can view list of all users with registration date and last activity
- [x] **ADMIN-02**: Admin can see usage metrics (total sessions, calls analyzed, active users)
- [x] **ADMIN-03**: Admin can view system health (API status, error rates)
- [x] **ADMIN-04**: Admin can manage content (view/edit personas, rubric configuration)

### Documentation

- [ ] **DOC-01**: Technical documentation covering architecture, APIs, and deployment
- [ ] **DOC-02**: User guide explaining all features for end users
- [ ] **DOC-03**: Training materials for client handover session

### Voice Platform

- [x] **VOICE-01**: Migrate voice agents from VAPI to Retell AI (7 agents)
- [x] **VOICE-02**: Integrate Retell SDK and webhook for voice practice flow

## v2 Requirements

Deferred to post-MVP. Tracked but not in current roadmap.

### Enhanced Analytics

- **ANAL-01**: Detailed breakdown of performance by scoring dimension
- **ANAL-02**: Comparison with peer benchmarks
- **ANAL-03**: AI-generated improvement recommendations based on history

### Advanced Admin

- **ADMN-01**: User management (suspend, delete accounts)
- **ADMN-02**: Custom persona creation via admin UI
- **ADMN-03**: Curriculum module management via admin UI
- **ADMN-04**: Export usage reports (CSV, PDF)

### Mobile Experience

- **MOB-01**: Responsive mobile-optimized practice flow
- **MOB-02**: Push notifications for reminders

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time multiplayer | High complexity, not contracted |
| Native mobile app | Web-first, out of contract scope |
| Payment integration | Client handles billing externally |
| Multi-tenant support | Single deployment for this client |
| Video analysis | Audio-only per contract |
| LLM fine-tuning | Using API services, not custom models |
| Automated email sequences | Not in contract scope |
| Social/sharing features | Not relevant to training use case |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01 | Phase 1 | Complete |
| DASH-02 | Phase 2 | Complete |
| DASH-03 | Phase 1 | Complete |
| DASH-04 | Phase 2 | Complete |
| ADMIN-01 | Phase 3 | Complete |
| ADMIN-02 | Phase 4 | Complete |
| ADMIN-03 | Phase 4 | Complete |
| ADMIN-04 | Phase 3 | Complete |
| DOC-01 | Phase 5 | Pending |
| DOC-02 | Phase 6 | Pending |
| DOC-03 | Phase 6 | Pending |
| VOICE-01 | Phase 7 | Complete |
| VOICE-02 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-25 — Phase 7 added (Retell migration)*
