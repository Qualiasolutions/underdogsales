// Underdog AI - VAPI Assistant Configuration

import { type Persona, getPersonaSystemPrompt } from './personas';

export interface VAPIAssistantConfig {
  name: string;
  model: {
    provider: 'openai' | 'anthropic';
    model: string;
    temperature: number;
    systemPrompt: string;
  };
  voice: {
    provider: '11labs';
    voiceId: string;
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  transcriber: {
    provider: 'deepgram';
    model: string;
    language: string;
  };
  firstMessage: string;
  endCallMessage?: string;
  serverUrl?: string;
  serverUrlSecret?: string;
  analysisPlan?: {
    summaryPrompt: string;
    structuredDataSchema: object;
  };
}

export const createRoleplayAssistant = (
  persona: Persona,
  scenario: string,
  webhookUrl: string
): VAPIAssistantConfig => {
  return {
    name: `Underdog Coach - ${persona.name}`,
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.8,
      systemPrompt: getPersonaSystemPrompt(persona, scenario),
    },
    voice: {
      provider: '11labs',
      voiceId: persona.voiceId,
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.3,
      useSpeakerBoost: true,
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
    firstMessage: getPersonaGreeting(persona),
    endCallMessage: 'Alright, I need to go. Goodbye.',
    serverUrl: webhookUrl,
    analysisPlan: {
      summaryPrompt: ANALYSIS_PROMPT,
      structuredDataSchema: SCORING_SCHEMA,
    },
  };
};

const getPersonaGreeting = (persona: Persona): string => {
  const greetings: Record<string, string> = {
    skeptical_cfo: "Yes? Who is this?",
    busy_vp_sales: "Marcus Johnson. What do you need?",
    friendly_gatekeeper: "Good morning, Nexus Enterprises, Emily speaking. How can I help you?",
    defensive_manager: "David Park speaking.",
    interested_but_stuck: "Hello, this is Jennifer.",
    aggressive_closer: "Yeah, who's this?",
  };
  return greetings[persona.id] || "Hello?";
};

const ANALYSIS_PROMPT = `Analyze this cold call practice session based on the Underdog Sales methodology.

## SCORING DIMENSIONS (100 points total)

### 1. OPENER (15 points)
- Permission-based? Asked for time?
- Attention-grabbing? Stood out?
- Clear timeframe set?

### 2. PITCH (15 points)
- Problem-focused (not features)?
- Specific ICP mentioned?
- Used "I have a feeling you'll tell me..." technique?

### 3. DISCOVERY (25 points) - MOST IMPORTANT
- Got prospect to identify which problem?
- Got a CONCRETE EXAMPLE? (This is critical)
- Explored impact without saying "impact"?
- Found root cause? (How long, what tried, where from?)

### 4. OBJECTION HANDLING (20 points)
- Paused 2-3 seconds before responding?
- Acknowledged/repeated the objection?
- Asked permission before probing?
- Stayed calm and curious (not defensive)?

### 5. CLOSING (15 points)
- Summarized the discussion?
- Tested emotional buy-in ("have you given up")?
- Used negative framing ("would it be a bad idea")?
- Avoided trigger words (meeting, demo, calendar)?

### 6. COMMUNICATION (10 points)
- Talk ratio under 40%?
- Minimal filler words?
- Good pace and clarity?

## OUTPUT FORMAT
Provide:
1. Score for each dimension (1-10)
2. Specific feedback with timestamps
3. Top 2 strengths
4. Top 2 areas to improve
5. One key moment that made the biggest difference

Be specific and actionable. Reference exact phrases they used.`;

const SCORING_SCHEMA = {
  type: 'object',
  properties: {
    overall_score: {
      type: 'number',
      description: 'Overall score 0-100',
    },
    dimensions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          score: { type: 'number', minimum: 1, maximum: 10 },
          feedback: { type: 'string' },
        },
      },
    },
    strengths: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 2,
    },
    improvements: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 2,
    },
    key_moment: { type: 'string' },
    got_example: {
      type: 'boolean',
      description: 'Did they get a concrete example of the problem?',
    },
    got_meeting: {
      type: 'boolean',
      description: 'Did they successfully book a next step?',
    },
    talk_ratio_percent: {
      type: 'number',
      description: 'Percentage of call where salesperson was talking',
    },
  },
  required: ['overall_score', 'dimensions', 'strengths', 'improvements', 'key_moment'],
};

// Tool definitions for VAPI function calling
export const VAPI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'end_roleplay',
      description: 'End the roleplay session. Call this when the prospect ends the call or the conversation naturally concludes.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            enum: ['prospect_hung_up', 'meeting_booked', 'call_completed', 'salesperson_ended'],
            description: 'Why the call ended',
          },
          meeting_booked: {
            type: 'boolean',
            description: 'Whether a meeting/next step was agreed to',
          },
        },
        required: ['reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_objection',
      description: 'Log when an objection is raised. Call this each time you (as the prospect) raise an objection.',
      parameters: {
        type: 'object',
        properties: {
          objection_type: {
            type: 'string',
            description: 'Category of objection',
          },
          objection_text: {
            type: 'string',
            description: 'What you said',
          },
          handled_well: {
            type: 'boolean',
            description: 'Did the salesperson handle it well?',
          },
        },
        required: ['objection_type', 'objection_text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_milestone',
      description: 'Log when a key milestone is reached in the call',
      parameters: {
        type: 'object',
        properties: {
          milestone: {
            type: 'string',
            enum: [
              'permission_granted',
              'pitch_delivered',
              'problem_identified',
              'example_given',
              'impact_discussed',
              'root_cause_found',
              'objection_raised',
              'summary_given',
              'close_attempted',
              'meeting_agreed',
            ],
            description: 'Which milestone was reached',
          },
          quality: {
            type: 'string',
            enum: ['excellent', 'good', 'poor'],
            description: 'How well they executed this step',
          },
          notes: {
            type: 'string',
            description: 'Brief note about what happened',
          },
        },
        required: ['milestone'],
      },
    },
  },
];

// Scenario templates
export const SCENARIOS = {
  cold_call_full: {
    id: 'cold_call_full',
    name: 'Full Cold Call',
    description: 'Complete cold call from opener to close',
    instructions: 'Practice a complete cold call following the Underdog methodology.',
    duration_target: 300, // 5 minutes
  },
  opener_only: {
    id: 'opener_only',
    name: 'Opener Practice',
    description: 'Focus on opening lines and getting permission',
    instructions: 'Practice different openers. End after pitch is delivered.',
    duration_target: 60,
  },
  objection_gauntlet: {
    id: 'objection_gauntlet',
    name: 'Objection Gauntlet',
    description: 'Rapid-fire objection handling practice',
    instructions: 'The prospect will throw multiple objections. Practice handling them calmly.',
    duration_target: 180,
  },
  discovery_deep: {
    id: 'discovery_deep',
    name: 'Deep Discovery',
    description: 'Focus on getting examples and understanding root cause',
    instructions: 'The prospect has problems but needs to be drawn out. Focus on discovery.',
    duration_target: 240,
  },
  gatekeeper_nav: {
    id: 'gatekeeper_nav',
    name: 'Gatekeeper Navigation',
    description: 'Get past the gatekeeper to the decision maker',
    instructions: 'Navigate through a gatekeeper to reach the target.',
    duration_target: 120,
  },
};

export type ScenarioId = keyof typeof SCENARIOS;
