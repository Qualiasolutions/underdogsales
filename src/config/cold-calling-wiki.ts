/**
 * Cold Calling Wiki Methodology
 * Source: https://www.coldcallingwiki.com/
 *
 * This config contains the exact teachings from Cold Calling Wiki
 * used to score and provide feedback on practice calls.
 */

export const WIKI_METHODOLOGY = {
  opener: {
    title: 'Opener',
    weight: 0.15,
    wikiUrl: 'https://www.coldcallingwiki.com/docs/openers',
    principles: [
      'Permission-Based Openers (PBOs) give prospects a way out, triggering Reciprocity',
      'Due to Reactance, pushing your pitch triggers resistance',
      'Humor helps - humans appreciate it',
      'First impressions count - a strong opener sets the tone',
    ],
    criteria: {
      permission_based: {
        name: 'Permission-Based Opening',
        description: 'Asked for permission to continue (PBO)',
        weight: 0.3,
        goodPhrases: [
          'do you mind', 'would you', 'can i', 'may i', 'let me have',
          'give me', 'help me', '30 seconds', 'can you help me understand',
        ],
        wikiExample: '"I\'ll be upfront, {name}, it\'s a dreaded cold call. Do you want to throw your phone out the window now, or let me have 30 seconds and then decide?"',
        feedback: {
          good: 'Excellent permission-based opener - you gave the prospect control',
          bad: 'Ask for permission early. Try: "Can you help me understand if this is relevant?"',
        },
      },
      attention_grab: {
        name: 'Attention Grabbing',
        description: 'Used humor, honesty, or a pattern interrupt',
        weight: 0.25,
        goodPhrases: [
          'cold call', 'dreaded', 'honest', 'upfront', 'won\'t take long',
          'throw your phone', 'direct', 'sales call',
        ],
        wikiExample: '"I\'ll be completely honest {name}, this is a sales call. You can hang up now, or let me have 30 seconds. It\'s up to you."',
        feedback: {
          good: 'Strong attention-grabbing opener with honesty/humor',
          bad: 'Try using honesty or humor to grab attention. Wiki tip: "I\'ll be upfront, it\'s a dreaded cold call"',
        },
      },
      clear_timeframe: {
        name: 'Time Expectation',
        description: 'Set a clear time expectation (e.g., "30 seconds")',
        weight: 0.2,
        goodPhrases: ['30 seconds', 'minute', 'quick', 'brief', 'won\'t take long'],
        wikiExample: '"Let me have 30 seconds and then decide"',
        feedback: {
          good: 'Good time expectation setting - reduces prospect anxiety',
          bad: 'Set a clear time expectation. Try: "Let me have 30 seconds"',
        },
      },
      tone_friendly: {
        name: 'Warm Tone',
        description: 'Warm, confident, non-aggressive tone',
        weight: 0.25,
        badPhrases: ['you need', 'you must', 'you have to', 'listen'],
        wikiTip: 'Be nice and give people freedom, they\'ll react better',
        feedback: {
          good: 'Appropriate warm tone - not pushy or aggressive',
          bad: 'Avoid pushy language like "you need" or "you must". Be friendly and give control to the prospect.',
        },
      },
    },
  },

  pitch: {
    title: 'Pitch',
    weight: 0.15,
    wikiUrl: 'https://www.coldcallingwiki.com/docs/the-pitch',
    principles: [
      'Humans are 2x more likely to prioritize fixing a problem than gaining a benefit (Negative Bias)',
      'Lead with problems, not features or benefits',
      'You\'ll sound like most salespeople if you focus on benefits',
      'Crystal clear understanding of their problems is crucial',
    ],
    template: `Our clients are {qualifying adjective} {well-defined ICP} who see a couple of obstacles to {desired outcome}:
- {Problem 1 + Consequence}
- {Problem 2 + Consequence}
I have a feeling you'll tell me you have the opposite problem; {opposite problem, exaggerated}.`,
    criteria: {
      problem_focused: {
        name: 'Problem-Focused',
        description: 'Led with problems rather than features',
        weight: 0.35,
        goodPhrases: ['problem', 'challenge', 'struggle', 'issue', 'obstacle', 'frustrat'],
        badPhrases: ['our software', 'our product', 'we offer', 'features include', 'our solution does'],
        wikiTip: 'Humans are naturally sceptical of positive selling',
        feedback: {
          good: 'Excellent problem-focused pitch - you led with their pain',
          bad: 'Lead with problems, not features. Wiki: "Humans are 2x more likely to prioritize fixing a problem"',
        },
      },
      specific_icp: {
        name: 'ICP Clarity',
        description: 'Clearly identified target persona/company type',
        weight: 0.2,
        goodPhrases: ['clients', 'companies like', 'founders', 'teams', 'businesses', 'work with'],
        wikiExample: '"Our clients are ambitious Founders of B2B SaaS who see a couple of obstacles..."',
        feedback: {
          good: 'Clear ICP identification - prospect knows you understand their world',
          bad: 'Identify your target clearly. Try: "Our clients are {qualifying adjective} {ICP}..."',
        },
      },
      used_template: {
        name: 'Pitch Structure',
        description: 'Used the problem-based pitch template structure',
        weight: 0.25,
        goodIndicators: ['clients', 'typically', 'usually', 'work with', 'help', 'obstacles', 'couple of'],
        feedback: {
          good: 'Good pitch structure following the wiki template',
          bad: 'Use the problem-based pitch template: Problems + Consequences, then negative close',
        },
      },
      negative_close: {
        name: 'Negative Close',
        description: 'Used "opposite problem" technique',
        weight: 0.2,
        goodPhrases: [
          'opposite problem', 'have a feeling', 'probably tell me', 'guess you',
          'barking up the wrong', 'couldn\'t handle more',
        ],
        wikiExample: '"I have a feeling you\'ll tell me you have the opposite problem; you couldn\'t handle one more client"',
        feedback: {
          good: 'Great use of negative framing in pitch - this disarms resistance',
          bad: 'End your pitch with: "I have a feeling you\'ll tell me you have the opposite problem..."',
        },
      },
    },
  },

  discovery: {
    title: 'Discovery',
    weight: 0.25,
    wikiUrl: 'https://www.coldcallingwiki.com/docs/qualifying-questions',
    principles: [
      'As long as you are asking the questions, you retain control',
      'Most salespeople are far too happy to overshare when asked a question',
      'Qualify questions back to the prospect',
      'Don\'t rush to the solution - stay on the problem',
    ],
    techniques: [
      '"When you say X, what do you mean?"',
      '"I\'m guessing X is important to you for a reason?"',
      '"That\'s a great question. Before I launch myself into the pitch, what do you mean exactly?"',
    ],
    criteria: {
      got_example: {
        name: 'Got Concrete Example',
        description: 'Asked for and got a specific example',
        weight: 0.35,
        goodPhrases: [
          'example', 'instance', 'specific', 'what does that look like',
          'in your world', 'tell me more', 'walk me through',
        ],
        wikiTip: 'Always qualify questions back - ask "What do you mean exactly?"',
        feedback: {
          good: 'Excellent - you got a concrete example of their problem',
          bad: 'Always ask for a concrete example. Try: "Can you give me a specific example?"',
        },
      },
      understood_impact: {
        name: 'Explored Consequences',
        description: 'Asked about consequences without saying "impact"',
        weight: 0.25,
        goodPhrases: ['what would happen', 'what does that mean', 'affect', 'consequence', 'result in'],
        badPhrases: ['impact'],
        wikiTip: 'Avoid the word "impact" - too salesy',
        feedback: {
          good: 'Good exploration of consequences without using "impact"',
          bad: 'Ask about what this means for them. Avoid "impact" - too salesy',
        },
      },
      found_root_cause: {
        name: 'Root Cause Exploration',
        description: 'Dug into where the problem comes from',
        weight: 0.2,
        goodPhrases: ['how long', 'where does', 'why do you think', 'tried to fix', 'what have you done'],
        wikiTip: 'The aim is always getting the prospect to think more deeply about the problem',
        feedback: {
          good: 'Good root cause exploration - you understand the problem source',
          bad: 'Dig deeper. Ask: "How long has this been going on?" or "What have you tried?"',
        },
      },
      stayed_on_problem: {
        name: 'Stayed on Problem',
        description: 'Didn\'t rush to solution',
        weight: 0.2,
        badPhrases: ['our solution', 'we can fix', 'let me show you', 'our product', 'demo'],
        wikiTip: 'Retain control by asking questions - don\'t overshare',
        feedback: {
          good: 'Good discipline - you kept the focus on their problem',
          bad: 'Don\'t rush to the solution. Stay on the problem - let them feel the pain.',
        },
      },
    },
  },

  objection_handling: {
    title: 'Objection Handling',
    weight: 0.2,
    wikiUrl: 'https://www.coldcallingwiki.com/docs/objections-wiki',
    principles: [
      'Pause 2-3 seconds before responding',
      'Accept and repeat the objection',
      'Ask permission before probing further',
      'Stay calm and curious, not defensive',
    ],
    framework: [
      '1. PAUSE for 2-3 seconds (gives you time to think)',
      '2. ACCEPT AND REPEAT: "I thought you might say that"',
      '3. ASK PERMISSION: "Do you mind if I ask a question about that?"',
      '4. Tonality: Calm, Curious, Cool (NOT sarcastic, high-pitched, or annoyed)',
    ],
    criteria: {
      paused: {
        name: 'Paused Before Responding',
        description: 'Took a 2-3 second pause',
        weight: 0.2,
        wikiTip: 'Pause for 2-3 seconds. It gives you time to think AND slow down.',
        feedback: {
          good: 'Good pacing - you paused before responding to objections',
          bad: 'Wiki framework: Pause 2-3 seconds before responding to objections',
        },
      },
      acknowledged: {
        name: 'Acknowledged Objection',
        description: 'Accepted and/or repeated the objection',
        weight: 0.25,
        goodPhrases: [
          'i thought you might', 'i understand', 'that makes sense',
          'i hear you', 'fair enough', 'ouch', 'i\'m not surprised',
        ],
        wikiExamples: [
          '"I thought you might say that"',
          '"Ouch, it must be frustrating to operate without budget"',
          '"I\'m not surprised, [competitor] is great"',
        ],
        feedback: {
          good: 'Great acknowledgment - you accepted the objection first',
          bad: 'Acknowledge objections before probing. Try: "I thought you might say that"',
        },
      },
      asked_permission: {
        name: 'Asked Permission to Probe',
        description: 'Asked permission before deeper questions',
        weight: 0.25,
        goodPhrases: [
          'do you mind if', 'can i ask', 'would it be okay',
          'one last question', 'before i go',
        ],
        wikiExample: '"Do you mind if I ask a question about that?"',
        feedback: {
          good: 'Good permission-based probing - builds rapport',
          bad: 'Ask permission before probing deeper. Try: "Do you mind if I ask one last question?"',
        },
      },
      calm_tonality: {
        name: 'Calm Tonality',
        description: 'Stayed calm and curious, not defensive',
        weight: 0.3,
        goodIndicators: ['curious', 'calm', 'cool'],
        badPhrases: ['but we', 'no, you\'re wrong', 'actually', 'you don\'t understand'],
        wikiTip: '✅ Calm, ✅ Curious, ✅ Cool | ❌ Sarcasm, ❌ High-pitched, ❌ Annoyed',
        feedback: {
          good: 'Excellent calm and curious tone when handling objections',
          bad: 'Stay curious, not defensive. Wiki: "Calm, Curious, Cool - never sarcastic or annoyed"',
        },
      },
    },
  },

  closing: {
    title: 'Closing',
    weight: 0.15,
    wikiUrl: 'https://www.coldcallingwiki.com/docs/closing',
    principles: [
      'You won\'t get married because your proposal was amazing',
      'If you\'ve done the rest well, closing is easy',
      'Summarize to show you listened',
      'Test emotion before asking for the meeting',
      'Use negative framing - saying NO makes people feel safe',
    ],
    avoidWords: ['meeting', 'calendar', 'demo', 'discovery'],
    criteria: {
      summarized: {
        name: 'Summarized Key Points',
        description: 'Recapped what the prospect mentioned',
        weight: 0.25,
        goodPhrases: [
          'let me see if i got', 'so you mentioned', 'to summarize',
          'you told me', 'what i\'m hearing',
        ],
        wikiTip: 'The summary is crucial as it shows the prospect you listened',
        feedback: {
          good: 'Great summary - you showed you were listening',
          bad: 'Summarize what they told you before closing. Wiki: "The summary shows you listened"',
        },
      },
      tested_emotion: {
        name: 'Tested Emotion',
        description: 'Asked how they feel about the problem',
        weight: 0.25,
        goodPhrases: [
          'how does that make you feel', 'given up', 'accepted',
          'frustrated', 'have you accepted this',
        ],
        wikiExamples: [
          '"How does this all make you feel?"',
          '"Have you given up trying to fix this?"',
          '"Have you accepted this is the way things are?"',
        ],
        feedback: {
          good: 'Good emotional check before closing',
          bad: 'Test emotion before closing. Ask: "How does this make you feel?" or "Have you given up on fixing this?"',
        },
      },
      negative_frame: {
        name: 'Negative Framing',
        description: 'Used "Would it be a bad idea..." framing',
        weight: 0.3,
        goodPhrases: [
          'would it be a bad idea', 'would you be against',
          'wouldn\'t make sense', 'be opposed',
        ],
        wikiExamples: [
          '"Would it be a bad idea to set some time aside and discuss this further?"',
          '"Would you be against having a sit down to dig deeper?"',
        ],
        wikiTip: 'Saying NO makes people feel safe and powerful. Phrase it negatively.',
        feedback: {
          good: 'Excellent use of negative framing - this is powerful',
          bad: 'Use negative framing. Try: "Would it be a bad idea to..." (saying NO makes people feel safe)',
        },
      },
      avoided_triggers: {
        name: 'Avoided Trigger Words',
        description: 'Avoided: meeting, demo, calendar, discovery',
        weight: 0.2,
        badPhrases: ['meeting', 'calendar', 'demo', 'discovery', 'schedule'],
        wikiTip: 'These words remind them it\'s a sales call - the prospect will have barely realized this is a cold call if you\'ve done well',
        feedback: {
          good: 'Good word choices - avoided trigger words',
          bad: 'Avoid trigger words: meeting, demo, calendar, discovery. These break the spell.',
        },
      },
    },
  },

  communication: {
    title: 'Communication',
    weight: 0.1,
    wikiUrls: [
      'https://www.coldcallingwiki.com/docs/tonality',
      'https://www.coldcallingwiki.com/docs/active-listening',
    ],
    principles: [
      'Your voice and tonality are your only body language on a call',
      'How you say things is more important than what you say',
      'Being more interested in others makes you more interesting to others',
      'Silence is ok - resist the urge to interrupt',
    ],
    criteria: {
      talk_ratio: {
        name: 'Talk Ratio',
        description: 'Listened more than talked (target: <40%)',
        weight: 0.3,
        target: 0.4,
        wikiTip: 'Active Listening: Being more interested in others makes you more interesting',
        feedback: {
          good: 'Good talk ratio - you listened more than you talked',
          bad: 'Listen more. Wiki: "Being more interested in others makes you more interesting to others"',
        },
      },
      filler_words: {
        name: 'Filler Words',
        description: 'Minimal use of um, uh, like, you know',
        weight: 0.25,
        badWords: ['um', 'uh', 'like', 'you know', 'basically', 'sort of', 'kind of'],
        targetRatio: 0.02,
        feedback: {
          good: 'Clear speech - minimal filler words',
          bad: 'Reduce filler words (um, uh, like, you know) - they undermine confidence',
        },
      },
      pace: {
        name: 'Speaking Pace',
        description: 'Appropriate speed (not too fast, not too slow)',
        weight: 0.25,
        targetWpm: { min: 120, max: 160 },
        wikiTip: 'Match the prospect\'s volume. If they\'re whispering, don\'t shout.',
        feedback: {
          good: 'Good speaking pace',
          bad: 'Adjust your pace. Tonality wiki: "Match the prospect\'s volume and energy"',
        },
      },
      clarity: {
        name: 'Clarity',
        description: 'Clear articulation and sentence structure',
        weight: 0.2,
        maxSentenceLength: 20,
        wikiTip: 'Don\'t sound sarcastic, aggressive or arrogant. Humans are excellent emotion detectors.',
        feedback: {
          good: 'Clear, concise communication',
          bad: 'Keep sentences short and clear. Avoid sarcasm - humans are excellent emotion detectors.',
        },
      },
    },
  },
}

// Scoring thresholds for realistic scores
export const SCORING_THRESHOLDS = {
  // Minimum call requirements
  minimumCallDuration: 30, // seconds - anything under this can't be properly scored
  minimumUserTurns: 3, // user needs at least 3 turns to evaluate
  minimumUserWords: 50, // user needs to say at least 50 words

  // Score adjustments based on call quality
  shortCallPenalty: 0.5, // multiply score by this for very short calls (< 60s)
  noSubstancePenalty: 0.3, // multiply by this for calls with no real substance

  // Score labels
  labels: {
    excellent: { min: 8.5, label: 'Excellent', color: 'text-green-600' },
    good: { min: 7, label: 'Good', color: 'text-emerald-500' },
    average: { min: 5, label: 'Average', color: 'text-yellow-500' },
    needsWork: { min: 3, label: 'Needs Work', color: 'text-orange-500' },
    poor: { min: 0, label: 'Poor', color: 'text-red-500' },
  },
}

export type WikiDimension = keyof typeof WIKI_METHODOLOGY
