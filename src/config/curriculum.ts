import type { CurriculumModule } from '@/types'

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 1,
    name: 'Call Structure',
    description: 'Master the complete cold call flow from opener to secure close',
    topics: ['flow', 'psychology', 'framework'],
    content: `Cold calls are predictable when you have structure. The framework is based on human psychology.

## Call Flow
1. **Opener** - Grab attention, get permission
2. **The Pitch** - Present 1-3 problems you fix
3. **Problem** - Get them to pick which problem matters most
4. **Example** - Make the problem real with a concrete example
5. **Impact** - Understand what this means for them
6. **Root Cause** - Where does the problem come from?
7. **Summary** - Show you listened, test if they've given up
8. **Closing** - Low commitment, negatively framed ask
9. **Secure Close** - Lock in the commitment`,
  },
  {
    id: 2,
    name: 'Openers',
    description: 'Permission-based openers that set the right tone',
    topics: ['permission_based', 'attention', 'tone', 'success_rates'],
    content: `First impressions count. Permission-Based Openers work because of Reactance and Reciprocity.

## Top Openers
- **ABM Opener (89%)**: "You weren't expecting my call, but I hope you can help..."
- **Humorous (79%)**: "It's a dreaded cold call. Want to throw your phone out the window?"

## Key Principles
- Ask for permission
- Give them freedom
- Set clear time expectations
- Don't push your pitch immediately`,
  },
  {
    id: 3,
    name: 'The Pitch',
    description: 'Problem-focused pitches that resonate 2x stronger',
    topics: ['problems_over_benefits', 'template', 'icp', 'negative_bias'],
    content: `Humans are 2x as likely to fix a problem as to gain a benefit (Negative Bias + Risk Aversion).

## Pitch Template
"Our clients are {qualifying adjective} {ICP} who see obstacles to {desired outcome}:
• {Problem 1 + Consequence}
• {Problem 2 + Consequence}
• {Problem 3 + Consequence}
I have a feeling you'll tell me you have the opposite problem..."

## Key Insight
Focus on pressing, underlying problems - not features.`,
  },
  {
    id: 4,
    name: 'Discovery',
    description: 'Get examples, understand impact, find root causes',
    topics: ['example', 'impact', 'root_cause', 'mirroring'],
    content: `Once you have the example, the problem is real. No example = no problem.

## Getting the Example
- "When you say you're experiencing {problem}, can you give me an example?"
- "How does that look in your world?"

## Understanding Impact
Don't use the word "impact" - too salesy. Instead:
- "What would happen if you just left things as they are?"
- "Why is this such a problem for you?"

## Finding Root Cause
- "What have you done to fix this in the past? Why didn't it work?"
- "Where do you think the problem comes from?"`,
  },
  {
    id: 5,
    name: 'Objections',
    description: 'Framework for handling any objection with calm curiosity',
    topics: ['framework', 'tonality', 'responses', 'brush_offs'],
    content: `Objections are either brush-offs or real concerns. Your job is to determine which.

## Framework
1. **Pause** - 2-3 seconds
2. **Accept/Repeat** - "I thought you might say that"
3. **Ask Permission** - "Do you mind if I ask a question?"
4. **Question** - Probe deeper

## Tonality
- Stay calm, curious, cool
- Never sarcastic or defensive
- Questions, not statements`,
  },
  {
    id: 6,
    name: 'Closing',
    description: 'Negative framing and securing the commitment',
    topics: ['negative_frame', 'trigger_words', 'summary', 'secure_close'],
    content: `If you've done discovery right, closing is easy. Just don't trigger resistance.

## Avoid Trigger Words
- Meeting, Calendar, Demo, Discovery

## Negative Framing
"Would it be a bad idea to sit down and explore this?"
Saying NO makes people feel safe and powerful.

## Secure the Close
"Is there any reason come Tuesday at 3pm I may be left crying into my coffee because you haven't shown up?"`,
  },
  {
    id: 7,
    name: 'Gatekeeper',
    description: 'Techniques to get through to decision makers',
    topics: ['relationship', 'techniques', 'information_gathering'],
    content: `Buy direct lines when possible. But gatekeepers can be valuable information sources.

## Techniques
1. **Relationship-Based** - Build rapport over multiple calls
2. **Without Name** - Navigate to the right person
3. **Direct Approach** - For authoritative voices
4. **When Referred** - Use internal referrals
5. **Different Extensions** - Try alternate numbers`,
  },
  {
    id: 8,
    name: 'Psychology',
    description: 'Psychological principles that make sales work',
    topics: ['reactance', 'loss_aversion', 'negative_framing', 'availability_bias'],
    content: `Base your methodology on psychology, not what feels right.

## Key Principles
1. **Everyone loves talking about themselves** - Make it all about them
2. **Reactance** - Give freedom, they open up
3. **Loss Aversion** - 2x more likely to fix problems than gain benefits
4. **Negative Framing** - "Go for NO" triggers correction
5. **Availability Bias** - Get an example to make problems real`,
  },
  {
    id: 9,
    name: 'Attitude',
    description: 'Mindset and self-talk for cold calling success',
    topics: ['control', 'mantras', 'sonder', 'resilience'],
    content: `Cold calling is painful, boring, and demanding. It's also the most effective prospecting method.

## What You CAN Control
- Preparation, Attitude, Effort, Follow-up, Learning

## What You CANNOT Control
- Prospect's mood, situation, budget, timing, decision

## Useful Mantras
- "This person is lucky to get a call from me"
- "Cold calls solve their problems, not mine"`,
  },
  {
    id: 10,
    name: 'Disqualification',
    description: 'Test prospects to find real opportunities',
    topics: ['testing', 'reducing', 'emotional_investment'],
    content: `Most salespeople ignore red flags. Attempt to disqualify - real prospects will defend their problems.

## Testing Questions
- "On a scale of 1-10, how much is this affecting the business?"
- "Why didn't you pick a lower/higher number?"

## Reducing Techniques
- "It doesn't sound like anything would change if things stayed as they are"
- "It feels like it's not a big problem"

Let them convince YOU the problem matters.`,
  },
  {
    id: 11,
    name: 'Advanced Techniques',
    description: 'Enterprise and C-level specific strategies',
    topics: ['enterprise', 'c_level', 'multi_threading', 'champions'],
    content: `Enterprise and C-level require different approaches.

## C-Level Specifics
- They have less time, need faster value demonstration
- Speak in outcomes and numbers, not features
- Respect their time explicitly

## Enterprise Techniques
- Multi-thread across the organization
- Build internal champions
- Navigate procurement processes
- Longer sales cycles need more touchpoints`,
  },
  {
    id: 12,
    name: 'Review & Practice',
    description: 'Putting it all together with practice scenarios',
    topics: ['roleplay', 'scenarios', 'feedback', 'iteration'],
    content: `Knowledge without practice is useless. This module ties everything together.

## Practice Scenarios
1. Cold call to skeptical CFO
2. Handling "not interested" brush-off
3. Getting past a gatekeeper
4. Discovery with interested but stuck prospect
5. Closing after good discovery

## Self-Review Checklist
- Did I ask for permission?
- Did I focus on problems?
- Did I get an example?
- Did I find root cause?
- Did I use negative framing to close?`,
  },
]

export function getModuleById(id: number): CurriculumModule | undefined {
  return CURRICULUM_MODULES.find((m) => m.id === id)
}

export function getModulesByTopic(topic: string): CurriculumModule[] {
  return CURRICULUM_MODULES.filter((m) => m.topics.includes(topic))
}

export function getAllModules(): CurriculumModule[] {
  return CURRICULUM_MODULES
}
