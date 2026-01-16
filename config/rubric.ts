// Underdog AI - Scoring Rubric based on Underdog Sales Methodology

export interface Criterion {
  id: string;
  name: string;
  description: string;
  indicators: {
    excellent: string[];
    good: string[];
    poor: string[];
  };
}

export interface ScoringDimension {
  id: string;
  name: string;
  weight: number;
  criteria: Criterion[];
}

export const SCORING_RUBRIC: ScoringDimension[] = [
  {
    id: 'opener',
    name: 'Opener',
    weight: 0.15,
    criteria: [
      {
        id: 'permission_based',
        name: 'Permission-Based',
        description: 'Asked for permission to continue the conversation',
        indicators: {
          excellent: [
            'Used explicit permission ask ("Can I have 30 seconds?")',
            'Acknowledged it\'s a cold call upfront',
            'Gave prospect control ("It\'s up to you")',
          ],
          good: [
            'Asked if it\'s a good time',
            'Offered to call back',
            'Showed respect for their time',
          ],
          poor: [
            'Launched straight into pitch',
            'No permission ask',
            'Assumed they had time',
          ],
        },
      },
      {
        id: 'attention_grab',
        name: 'Attention Grab',
        description: 'Used hook, humor, or pattern interrupt to stand out',
        indicators: {
          excellent: [
            'Used humor effectively ("throw your phone out the window")',
            'Pattern interrupt that got attention',
            'Personalized/ABM approach',
          ],
          good: [
            'Interesting opening line',
            'Showed some personality',
            'Differentiated from typical calls',
          ],
          poor: [
            'Generic "How are you today?"',
            'Boring/scripted opener',
            'Sounded like every other cold call',
          ],
        },
      },
      {
        id: 'clear_timeframe',
        name: 'Clear Timeframe',
        description: 'Set clear expectation for how long the call will take',
        indicators: {
          excellent: [
            'Specific time ask ("30 seconds", "2 minutes")',
            'Promise to respect their time',
          ],
          good: [
            'Implied brevity',
            'Mentioned being quick',
          ],
          poor: [
            'No time expectation set',
            'Open-ended ask',
          ],
        },
      },
    ],
  },
  {
    id: 'pitch',
    name: 'The Pitch',
    weight: 0.15,
    criteria: [
      {
        id: 'problem_focused',
        name: 'Problem-Focused',
        description: 'Led with problems, not features or benefits',
        indicators: {
          excellent: [
            'Presented 2-3 specific problems they solve',
            'Problems had clear consequences attached',
            'No features mentioned in pitch',
          ],
          good: [
            'Mentioned problems but mixed with features',
            'Some problem focus',
          ],
          poor: [
            'Feature dump',
            'Focused on what product does, not problems',
            'Used buzzwords without substance',
          ],
        },
      },
      {
        id: 'specific_icp',
        name: 'Specific ICP',
        description: 'Clearly defined the ideal customer profile',
        indicators: {
          excellent: [
            'Used qualifying adjective + clear ICP',
            'Prospect could self-identify',
            '"Ambitious founders of B2B SaaS"',
          ],
          good: [
            'Mentioned target audience',
            'Some specificity',
          ],
          poor: [
            'Vague audience ("companies like yours")',
            'No ICP mentioned',
          ],
        },
      },
      {
        id: 'negative_close_pitch',
        name: 'Negative Close in Pitch',
        description: 'Used "I have a feeling you\'ll tell me..." technique',
        indicators: {
          excellent: [
            'Used exact technique: "I have a feeling you\'ll tell me [opposite problem]"',
            'Triggered prospect to correct them',
          ],
          good: [
            'Some form of negative framing',
            'Invited pushback',
          ],
          poor: [
            'Assumed they had problems',
            'Pushed for agreement',
          ],
        },
      },
    ],
  },
  {
    id: 'discovery',
    name: 'Discovery',
    weight: 0.25,
    criteria: [
      {
        id: 'got_problem',
        name: 'Identified Problem',
        description: 'Got prospect to identify which problem resonates',
        indicators: {
          excellent: [
            'Asked which problem resonates most',
            'Let prospect choose/prioritize',
            'Stayed on their chosen problem',
          ],
          good: [
            'Asked about problems',
            'Explored one issue',
          ],
          poor: [
            'Assumed the problem',
            'Skipped problem identification',
          ],
        },
      },
      {
        id: 'got_example',
        name: 'Got Concrete Example',
        description: 'Extracted a specific example of the problem',
        indicators: {
          excellent: [
            'Asked "Can you give me an example?"',
            'Got specific story/situation',
            'Example made problem tangible',
          ],
          good: [
            'Some specificity about the problem',
            'Asked clarifying questions',
          ],
          poor: [
            'Accepted vague problem statement',
            'No example requested',
            'Rushed past this step',
          ],
        },
      },
      {
        id: 'understood_impact',
        name: 'Understood Impact',
        description: 'Explored consequences without using "impact"',
        indicators: {
          excellent: [
            'Asked "What happens if nothing changes?"',
            'Explored business/personal consequences',
            'Didn\'t use word "impact"',
          ],
          good: [
            'Some impact exploration',
            'Asked follow-up questions',
          ],
          poor: [
            'Said "What\'s the impact?"',
            'Skipped consequences',
            'Assumed they understood severity',
          ],
        },
      },
      {
        id: 'found_root_cause',
        name: 'Found Root Cause',
        description: 'Dug into why the problem exists and persists',
        indicators: {
          excellent: [
            'Asked "How long has this been going on?"',
            'Asked "What have you tried?"',
            'Asked "Where does this come from?"',
          ],
          good: [
            'Some exploration of history',
            'Asked about previous attempts',
          ],
          poor: [
            'Skipped root cause',
            'Rushed to solution',
            'Didn\'t understand why it persists',
          ],
        },
      },
    ],
  },
  {
    id: 'objection_handling',
    name: 'Objection Handling',
    weight: 0.2,
    criteria: [
      {
        id: 'paused',
        name: 'Paused Before Responding',
        description: 'Took 2-3 second pause before responding to objection',
        indicators: {
          excellent: [
            'Clear 2-3 second pause',
            'Showed they were thinking',
            'Didn\'t react defensively',
          ],
          good: [
            'Brief pause',
            'Didn\'t immediately argue',
          ],
          poor: [
            'Immediate response',
            'Talked over objection',
            'Defensive reaction',
          ],
        },
      },
      {
        id: 'acknowledged',
        name: 'Acknowledged Objection',
        description: 'Accepted/repeated the objection before addressing',
        indicators: {
          excellent: [
            '"I thought you might say that"',
            '"That makes sense"',
            'Repeated objection to show understanding',
          ],
          good: [
            'Some acknowledgment',
            'Didn\'t dismiss objection',
          ],
          poor: [
            'Ignored objection',
            'Immediately countered',
            '"But..."',
          ],
        },
      },
      {
        id: 'asked_permission_objection',
        name: 'Asked Permission to Probe',
        description: 'Asked permission before digging deeper',
        indicators: {
          excellent: [
            '"Do you mind if I ask one question?"',
            '"Can I ask about that?"',
            'Got permission before probing',
          ],
          good: [
            'Asked follow-up question',
            'Some permission seeking',
          ],
          poor: [
            'Pushed through without permission',
            'Aggressive questioning',
            'Argued with objection',
          ],
        },
      },
      {
        id: 'calm_tonality',
        name: 'Calm, Curious Tonality',
        description: 'Maintained calm, curious tone throughout',
        indicators: {
          excellent: [
            'Stayed genuinely curious',
            'Calm and collected',
            'Treated objection as information',
          ],
          good: [
            'Mostly calm',
            'Some curiosity',
          ],
          poor: [
            'Got defensive',
            'Sarcastic tone',
            'Frustrated or pushy',
          ],
        },
      },
    ],
  },
  {
    id: 'closing',
    name: 'Closing',
    weight: 0.15,
    criteria: [
      {
        id: 'summarized',
        name: 'Summarized Discussion',
        description: 'Recapped key points before asking for next step',
        indicators: {
          excellent: [
            '"Let me see if I got this right..."',
            'Summarized their problems accurately',
            'Made them feel heard',
          ],
          good: [
            'Some recap',
            'Referenced earlier points',
          ],
          poor: [
            'No summary',
            'Jumped straight to close',
          ],
        },
      },
      {
        id: 'tested_emotion',
        name: 'Tested Emotional Buy-in',
        description: 'Asked how they feel about the problem',
        indicators: {
          excellent: [
            '"Have you given up trying to fix this?"',
            '"How does this make you feel?"',
            'Got emotional commitment',
          ],
          good: [
            'Some emotional check-in',
            'Asked if it\'s a priority',
          ],
          poor: [
            'Assumed buy-in',
            'Skipped emotional test',
          ],
        },
      },
      {
        id: 'negative_frame',
        name: 'Used Negative Framing',
        description: 'Asked for meeting using negative frame',
        indicators: {
          excellent: [
            '"Would it be a bad idea to..."',
            '"Would you be against..."',
            'Let them say NO to not meeting',
          ],
          good: [
            'Soft ask',
            'Low pressure close',
          ],
          poor: [
            'Pushy close',
            '"Can we schedule a meeting?"',
            'Assumed next step',
          ],
        },
      },
      {
        id: 'avoided_triggers',
        name: 'Avoided Trigger Words',
        description: 'Didn\'t use meeting, demo, calendar, presentation',
        indicators: {
          excellent: [
            'No trigger words used',
            'Used "sit down", "explore", "take a look"',
          ],
          good: [
            'Mostly avoided triggers',
            'Minimal use',
          ],
          poor: [
            'Used "meeting", "demo", "calendar"',
            'Sounded like typical sales close',
          ],
        },
      },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    weight: 0.1,
    criteria: [
      {
        id: 'talk_ratio',
        name: 'Talk Ratio',
        description: 'Talked less than 40% of the conversation',
        indicators: {
          excellent: [
            'Under 35% talk time',
            'Let prospect do most talking',
            'Asked great questions',
          ],
          good: [
            '35-45% talk time',
            'Good balance',
          ],
          poor: [
            'Over 50% talk time',
            'Dominated conversation',
            'Monologued',
          ],
        },
      },
      {
        id: 'filler_words',
        name: 'Minimal Filler Words',
        description: 'Avoided excessive um, uh, like, you know',
        indicators: {
          excellent: [
            'Minimal filler words',
            'Clear, confident speech',
          ],
          good: [
            'Some fillers but not distracting',
          ],
          poor: [
            'Excessive fillers',
            'Undermined credibility',
          ],
        },
      },
      {
        id: 'pace',
        name: 'Appropriate Pace',
        description: 'Speaking speed was appropriate',
        indicators: {
          excellent: [
            'Varied pace appropriately',
            'Slowed down for important points',
            'Matched prospect\'s energy',
          ],
          good: [
            'Generally good pace',
          ],
          poor: [
            'Too fast/nervous',
            'Too slow/boring',
            'Monotone',
          ],
        },
      },
    ],
  },
];

export interface SessionScore {
  dimension: string;
  score: number; // 1-10
  weight: number;
  feedback: string;
  criteria_scores: {
    criterion_id: string;
    score: number;
    notes: string;
  }[];
}

export interface OverallScore {
  total: number; // 0-100
  dimensions: SessionScore[];
  strengths: string[];
  improvements: string[];
  key_moment: string;
}

export const calculateOverallScore = (dimensionScores: SessionScore[]): number => {
  return dimensionScores.reduce((total, dim) => {
    return total + (dim.score * dim.weight * 10);
  }, 0);
};
