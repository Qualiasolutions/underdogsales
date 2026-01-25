# Phase 6: User Guide & Handover - Research

**Researched:** 2026-01-25
**Domain:** User documentation, training materials, client handover
**Confidence:** HIGH

## Summary

This phase focuses on creating end-user documentation and client handover materials for the Underdog AI Sales Coach platform. Unlike technical documentation (Phase 5), user guides target salespeople learning the Underdog Sales methodology, not developers.

The research investigated three domains: (1) user documentation best practices for SaaS products, (2) training presentation design patterns, and (3) software project handover checklists. Key finding: user documentation should be task-oriented with screenshots showing actual workflows, organized by user goals rather than features.

**Primary recommendation:** Create a task-oriented user guide structured around the 5 main workflows (Voice Practice, Call Analysis, Chat Coaching, Curriculum, Dashboard) with annotated screenshots for each flow.

## Standard Stack

This phase produces documentation assets, not code. The "stack" is documentation tooling.

### Core

| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Markdown | User guide format | Version-controlled, renders in GitHub, works with existing docs/ folder |
| Mermaid | User flow diagrams | Consistent with Phase 5 technical docs, text-based |
| Screenshots | Visual walkthroughs | 67% higher task completion with annotated screenshots (TechSmith study) |
| Loom/screen recording | Training videos (optional) | Async-friendly for distributed teams |

### Supporting

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Figma annotations | Callouts on screenshots | Highlight UI elements in walkthrough images |
| Markdown tables | Quick reference cards | Summarize key info (personas, scoring, modules) |
| PDF export | Printable handover docs | Client may want offline reference |

### Not Needed

| Don't Use | Why |
|-----------|-----|
| Interactive walkthrough tools (WalkMe, Appcues) | Overkill for small user base, adds complexity |
| Dedicated FAQ software | Simple FAQ section in Markdown suffices |
| Help center platforms (Zendesk, Intercom) | Not needed until user base scales |

## Architecture Patterns

### Recommended Document Structure

```
docs/
├── USER_GUIDE.md              # Complete user documentation
├── TRAINING.md                # Training session materials
├── HANDOVER_CHECKLIST.md      # Client handover tracking
├── ARCHITECTURE.md            # (existing from Phase 5)
├── API.md                     # (existing from Phase 5)
├── DATABASE.md                # (existing from Phase 5)
├── DEPLOYMENT.md              # (existing from Phase 5)
└── INTEGRATIONS.md            # (existing from Phase 5)
```

### Pattern 1: Task-Oriented Documentation Structure

**What:** Organize user guide by user goals, not by feature/UI element.

**When to use:** All user-facing documentation.

**Structure:**
```markdown
# Feature Name

## What You Can Do
Brief description of the feature's purpose.

## Before You Start
Prerequisites (microphone permissions, login, etc.)

## Step-by-Step Guide

### Step 1: [Action verb]
1. Navigate to...
2. Click...
3. [Screenshot with callout]

### Step 2: [Action verb]
...

## Understanding Your Results
How to interpret scores, feedback, etc.

## Tips for Best Results
Pro tips, common mistakes to avoid.

## Troubleshooting
Common issues and solutions.
```

### Pattern 2: Diataxis Documentation Framework

**What:** Four types of documentation serving different user needs.

**When to use:** Comprehensive user documentation.

| Type | User Need | Example |
|------|-----------|---------|
| Tutorials | Learning | "Your First Practice Session" |
| How-to Guides | Goal completion | "How to Upload a Call Recording" |
| Reference | Information lookup | "Scoring Rubric Reference" |
| Explanation | Understanding | "How AI Scoring Works" |

**Application to USER_GUIDE.md:**
- Quick Start Tutorial (learning)
- Feature walkthroughs (how-to)
- Persona/scoring reference cards (reference)
- FAQ section (explanation)

### Pattern 3: Training Presentation Structure

**What:** Modular training deck with hands-on exercises.

**Structure:**
```markdown
# Training Session Agenda

## Part 1: Platform Overview (15 min)
- What is Underdog AI Sales Coach?
- The Underdog Sales methodology
- Platform capabilities

## Part 2: Voice Practice (30 min)
- Demo: Running a practice session
- Hands-on: Participants try first session
- Debrief: Understanding scores

## Part 3: Call Analysis (20 min)
- Demo: Uploading and analyzing a call
- Hands-on: Participants analyze sample call

## Part 4: Chat Coaching & Curriculum (15 min)
- Demo: Using the AI coach
- Walkthrough: Curriculum modules

## Part 5: Dashboard & Progress (10 min)
- Demo: Viewing history and trends
- Q&A

## Exercises
[Printable worksheets for hands-on activities]
```

### Anti-Patterns to Avoid

- **Feature-dump documentation:** Listing every button without explaining user goals.
- **Wall of text:** No screenshots or visual breaks in long procedures.
- **Assuming prior knowledge:** Not explaining Underdog Sales terminology to new users.
- **Mixing audiences:** Putting admin instructions in the general user guide.

## Don't Hand-Roll

Problems with existing solutions to use.

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Screenshot annotation | Custom image editor | Figma, Cleanshot, or native macOS Markup | Professional callouts, arrows, highlights |
| User flow diagrams | ASCII art | Mermaid flowcharts | Consistent with technical docs, auto-renders |
| PDF generation | Custom PDF builder | Markdown-to-PDF tools or browser print | Maintains formatting, easy updates |
| Video recording | Complex setup | Loom (free) or native screen recording | Quick, shareable, async-friendly |

**Key insight:** Focus effort on content quality, not tooling. Markdown + screenshots + Mermaid covers all needs.

## Common Pitfalls

### Pitfall 1: Writing for the Wrong Audience

**What goes wrong:** Documentation uses technical language that salespeople don't understand.

**Why it happens:** Writers assume familiarity with web apps, AI, or technical concepts.

**How to avoid:**
- Target audience: Salespeople who may not be tech-savvy
- Use sales terminology they know (prospects, objections, closing)
- Avoid: API, webhook, database, configuration
- Test: Would a salesperson understand this without asking?

**Warning signs:** Reviewers ask "what does this mean?"

### Pitfall 2: Missing Critical Setup Steps

**What goes wrong:** Users can't complete tasks because prerequisites weren't explained.

**Why it happens:** Writers assume microphone permissions, login states, or browser requirements.

**How to avoid:**
- Document all prerequisites at the start of each section
- Include "Before You Start" checklist for Voice Practice
- Test on fresh browser/incognito to catch missed assumptions

**Warning signs:** Support requests about "it doesn't work."

### Pitfall 3: Outdated Screenshots

**What goes wrong:** Screenshots don't match current UI, causing confusion.

**Why it happens:** UI changed but docs weren't updated.

**How to avoid:**
- Use generic annotations that survive minor UI changes
- Annotate key elements, not every button
- Date the screenshots in image filenames
- Plan to update after major UI changes

**Warning signs:** Screenshots show wrong colors, missing buttons, or different layouts.

### Pitfall 4: No Clear Success Criteria

**What goes wrong:** Users complete steps but don't know if they did it right.

**Why it happens:** Focus on process, not outcomes.

**How to avoid:**
- End each walkthrough with "You should now see..."
- Show expected result screenshots
- Include "Understanding Your Results" sections

**Warning signs:** Users ask "did it work?"

### Pitfall 5: Training Too Long

**What goes wrong:** Attendees lose focus, skip content, or forget material.

**Why it happens:** Trying to cover everything in one session.

**How to avoid:**
- Keep training under 90 minutes
- Focus on 3-4 core workflows, not every feature
- Include hands-on exercises (show, then do)
- Provide reference materials for later

**Warning signs:** Low engagement in later sections.

## Content to Document

### Features for User Guide

Based on codebase analysis, document these user-facing features:

| Feature | Page | Key Actions |
|---------|------|-------------|
| Voice Practice | `/practice` | Select persona, start call, end call, view results |
| Practice Results | `/practice/results/[id]` | View transcript, see scores, understand feedback |
| Call Analysis | `/analyze` | Upload recording, wait for processing, view analysis |
| Analysis Results | `/analyze/[id]` | Read transcript, interpret scores |
| Chat Coaching | `/chat` or `/coach` | Ask questions, get methodology answers |
| Curriculum | `/curriculum` | Browse modules, read content, track progress |
| Module Detail | `/curriculum/[id]` | Study module content |
| Dashboard | `/dashboard` | View history, progress, trends |
| Login/Signup | `/login`, `/signup` | Account creation, authentication |

### Admin Features (Separate Section)

| Feature | Page | Key Actions |
|---------|------|-------------|
| Admin Dashboard | `/admin` | View stats, navigate to sections |
| User Management | `/admin/users` | View users, access user details |
| User Detail | `/admin/users/[id]` | View user activity |
| Content View | `/admin/content` | Browse personas, rubric |
| Analytics | `/admin/analytics` | View platform metrics, system health |

### Personas to Document

| Name | Role | Difficulty | Key Traits |
|------|------|------------|------------|
| Sarah Chen | CFO | Hard | Skeptical, ROI-focused, no patience |
| Marcus Johnson | VP of Sales | Hard | Aggressive, interruptive, results-only |
| Emily Torres | Executive Assistant | Medium | Protective gatekeeper, dismissive |
| David Park | Sales Manager | Medium | Territorial, defensive |
| Lisa Martinez | Head of Ops | Medium | Stressed, wants solutions but hates process |
| Tony Ricci | Sales Director | Hard | Combative, testing |

### Scoring Dimensions to Explain

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Opener | 15% | Permission-based, attention, tone |
| Pitch | 15% | Problem-focused, ICP, template use |
| Discovery | 25% | Examples, impact, root cause |
| Objection Handling | 20% | Pause, acknowledge, permission, calm |
| Closing | 15% | Summary, emotion test, negative frame |
| Communication | 10% | Talk ratio, filler words, pace, clarity |

### Curriculum Modules (12 total)

1. Call Structure
2. Openers
3. The Pitch
4. Discovery
5. Objections
6. Closing
7. Gatekeeper
8. Psychology
9. Attitude
10. Disqualification
11. Advanced Techniques
12. Review & Practice

## Handover Checklist Elements

Based on software handover best practices, include these categories.

### Documentation Handover

- [ ] User guide complete and accessible
- [ ] Training materials provided
- [ ] Technical documentation shared (from Phase 5)
- [ ] Admin guide section included

### Access & Credentials

- [ ] Admin accounts created for client
- [ ] Supabase dashboard access (if needed)
- [ ] Vercel deployment access (if transferring)
- [ ] Retell AI dashboard access

### Knowledge Transfer

- [ ] Training session conducted
- [ ] Q&A session completed
- [ ] Support contact established
- [ ] Escalation process defined

### Platform Status

- [ ] All features operational
- [ ] No critical bugs
- [ ] Production environment stable
- [ ] Monitoring configured

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PDF user manuals | Markdown in repo | 2020s | Version-controlled, always current |
| In-person-only training | Hybrid with async materials | 2020-2024 | Remote-friendly, reviewable |
| Text-only guides | Visual walkthroughs with screenshots | 2018+ | 67% better task completion |
| Linear documentation | Task-oriented, searchable | 2019+ | Users find what they need faster |

**Current best practice:** Interactive in-app guides are trending (WalkMe, Appcues) but overkill for small user base. Start with solid Markdown docs, add in-app guidance if support volume warrants.

## Open Questions

### 1. Screenshot Capture Method

- **What we know:** Screenshots needed for all major workflows.
- **What's unclear:** Should we use actual user data or demo/seed data?
- **Recommendation:** Use demo data with realistic but fake names. Capture from production-like environment to ensure UI matches.

### 2. Training Delivery Format

- **What we know:** Training materials needed per requirements.
- **What's unclear:** Live training vs. recorded video vs. slide deck?
- **Recommendation:** Create TRAINING.md as a facilitator guide with agenda and talking points. Supports both live delivery and async reference. Add video recordings if budget allows.

### 3. Admin Documentation Audience

- **What we know:** Admin features exist (user management, analytics, content).
- **What's unclear:** Is client admin-level or just user-level?
- **Recommendation:** Include admin section in user guide. Mark clearly as "For Administrators." Covers both scenarios.

## Sources

### Primary (HIGH confidence)

- **Codebase analysis:** Direct inspection of `/src/config/personas.ts`, `/src/config/curriculum.ts`, `/src/config/rubric.ts` for accurate feature documentation
- **Existing docs:** Phase 5 technical documentation (ARCHITECTURE.md, INTEGRATIONS.md) for context

### Secondary (MEDIUM confidence)

- [ProProfs - Create SaaS Documentation](https://www.proprofskb.com/blog/create-perfect-saas-product-documentation-customers/) - SaaS documentation patterns
- [SlideModel - Training Presentation](https://slidemodel.com/training-presentation/) - Training deck structure
- [Door3 - Project Handover Checklist](https://www.door3.com/blog/project-handover-checklist) - Handover checklist patterns
- [Miquido - Software Handover Checklist](https://www.miquido.com/blog/software-project-handover-checklist/) - Handover best practices
- [TechSmith - User Documentation](https://www.techsmith.com/blog/user-documentation/) - Screenshot best practices (67% study)
- [UserGuiding - User Guide Examples](https://userguiding.com/blog/user-guide-examples) - Interactive walkthrough patterns
- [SketchBubble - Presentation Design 2026](https://www.sketchbubble.com/blog/presentation-design-trends-2026-the-ultimate-guide-to-future-ready-slides/) - Current presentation trends

### Tertiary (LOW confidence)

- General WebSearch results on FAQ software - Used for context only, not specific recommendations

## Metadata

**Confidence breakdown:**
- Content structure: HIGH - Based on established Diataxis framework and SaaS documentation patterns
- Feature list: HIGH - Verified against actual codebase
- Training structure: MEDIUM - Based on best practices, not specific to this audience
- Handover checklist: MEDIUM - Generic patterns, may need client-specific adjustments

**Research date:** 2026-01-25
**Valid until:** 2026-03-25 (60 days - stable domain, low change rate)
