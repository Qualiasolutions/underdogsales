import type { ScoringRubric, ScoreDimension } from '@/types'

export const SCORING_RUBRIC: ScoringRubric[] = [
  {
    dimension: 'opener',
    weight: 0.15,
    criteria: [
      {
        name: 'permission_based',
        description: 'Asked for permission to continue the conversation',
        weight: 0.3,
      },
      {
        name: 'attention_grab',
        description: 'Used humor, honesty, or a hook to grab attention',
        weight: 0.25,
      },
      {
        name: 'clear_timeframe',
        description: 'Set expectation for time needed (e.g., "30 seconds")',
        weight: 0.2,
      },
      {
        name: 'tone_friendly',
        description: 'Maintained warm, confident, non-aggressive tone',
        weight: 0.25,
      },
    ],
  },
  {
    dimension: 'pitch',
    weight: 0.15,
    criteria: [
      {
        name: 'problem_focused',
        description: 'Led with problems rather than features or benefits',
        weight: 0.35,
      },
      {
        name: 'specific_icp',
        description: 'Clearly identified target persona/company type',
        weight: 0.2,
      },
      {
        name: 'used_template',
        description: 'Followed the problem-based pitch template structure',
        weight: 0.25,
      },
      {
        name: 'negative_close',
        description: 'Used "opposite problem" technique at the end',
        weight: 0.2,
      },
    ],
  },
  {
    dimension: 'discovery',
    weight: 0.25,
    criteria: [
      {
        name: 'got_example',
        description: 'Successfully extracted a concrete example of the problem',
        weight: 0.35,
      },
      {
        name: 'understood_impact',
        description: 'Asked about consequences without using the word "impact"',
        weight: 0.25,
      },
      {
        name: 'found_root_cause',
        description: 'Dug into where the problem comes from',
        weight: 0.2,
      },
      {
        name: 'stayed_on_problem',
        description: "Didn't rush to solution; kept prospect talking about problems",
        weight: 0.2,
      },
    ],
  },
  {
    dimension: 'objection_handling',
    weight: 0.2,
    criteria: [
      {
        name: 'paused',
        description: 'Took a 2-3 second pause before responding',
        weight: 0.2,
      },
      {
        name: 'acknowledged',
        description: 'Accepted and/or repeated the objection',
        weight: 0.25,
      },
      {
        name: 'asked_permission',
        description: 'Asked permission before probing further',
        weight: 0.25,
      },
      {
        name: 'calm_tonality',
        description: 'Stayed calm and curious, not defensive or sarcastic',
        weight: 0.3,
      },
    ],
  },
  {
    dimension: 'closing',
    weight: 0.15,
    criteria: [
      {
        name: 'summarized',
        description: 'Recapped key points the prospect mentioned',
        weight: 0.25,
      },
      {
        name: 'tested_emotion',
        description: 'Asked how they feel or if they\'ve given up on fixing it',
        weight: 0.25,
      },
      {
        name: 'negative_frame',
        description: 'Used "Would it be a bad idea..." framing',
        weight: 0.3,
      },
      {
        name: 'avoided_triggers',
        description: 'Avoided words: meeting, demo, calendar, discovery',
        weight: 0.2,
      },
    ],
  },
  {
    dimension: 'communication',
    weight: 0.1,
    criteria: [
      {
        name: 'talk_ratio',
        description: 'Listened more than talked (target: <40% talk time)',
        weight: 0.3,
      },
      {
        name: 'filler_words',
        description: 'Minimal use of um, uh, like, you know',
        weight: 0.25,
      },
      {
        name: 'pace',
        description: 'Appropriate speaking speed (not too fast, not too slow)',
        weight: 0.25,
      },
      {
        name: 'clarity',
        description: 'Clear articulation and sentence structure',
        weight: 0.2,
      },
    ],
  },
]

export function getRubricByDimension(dimension: ScoreDimension): ScoringRubric | undefined {
  return SCORING_RUBRIC.find((r) => r.dimension === dimension)
}

export function calculateOverallScore(dimensionScores: Record<ScoreDimension, number>): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const rubric of SCORING_RUBRIC) {
    const score = dimensionScores[rubric.dimension]
    if (score !== undefined) {
      weightedSum += score * rubric.weight
      totalWeight += rubric.weight
    }
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0
}

export function getDimensionWeight(dimension: ScoreDimension): number {
  const rubric = getRubricByDimension(dimension)
  return rubric?.weight || 0
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Average'
  if (score >= 3) return 'Needs Work'
  return 'Poor'
}

export function getScoreColor(score: number): string {
  if (score >= 9) return 'text-green-600'
  if (score >= 7) return 'text-emerald-500'
  if (score >= 5) return 'text-yellow-500'
  if (score >= 3) return 'text-orange-500'
  return 'text-red-500'
}
