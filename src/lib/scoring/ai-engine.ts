/**
 * AI-Powered Scoring Engine
 * Uses OpenRouter GPT-4o to analyze calls based on Cold Calling Wiki methodology
 *
 * This provides intelligent, context-aware feedback based exactly on
 * https://www.coldcallingwiki.com/
 */

import { callOpenRouter } from '@/lib/openrouter'
import { SCORING_THRESHOLDS } from '@/config/cold-calling-wiki'
import { logger } from '@/lib/logger'
import type { TranscriptEntry, ScoreDimension, DimensionScore } from '@/types'

export interface AIScoringInput {
  transcript: TranscriptEntry[]
  durationSeconds: number
  scenarioType: string
}

export interface AIScoringResult {
  overallScore: number
  dimensionScores: Record<ScoreDimension, DimensionScore>
  summary: string
  strengths: string[]
  improvements: string[]
  callQuality: 'sufficient' | 'too_short' | 'no_substance'
}

interface AIAnalysisResponse {
  opener: DimensionAnalysis
  pitch: DimensionAnalysis
  discovery: DimensionAnalysis
  objection_handling: DimensionAnalysis
  closing: DimensionAnalysis
  communication: DimensionAnalysis
  overall_summary: string
  top_strengths: string[]
  priority_improvements: string[]
}

interface DimensionAnalysis {
  score: number
  feedback: string
  criteria_results: {
    name: string
    passed: boolean
    note: string
  }[]
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length
}

function assessCallQuality(
  transcript: TranscriptEntry[],
  durationSeconds: number
): { quality: 'sufficient' | 'too_short' | 'no_substance'; reason?: string } {
  const userMessages = transcript.filter(t => t.role === 'user')
  const userText = userMessages.map(m => m.content).join(' ')
  const userWordCount = countWords(userText)
  const userTurns = userMessages.length

  // Check minimum requirements
  if (durationSeconds < SCORING_THRESHOLDS.minimumCallDuration) {
    return {
      quality: 'too_short',
      reason: `Call was only ${durationSeconds}s. Need at least ${SCORING_THRESHOLDS.minimumCallDuration}s for meaningful scoring.`,
    }
  }

  if (userTurns < SCORING_THRESHOLDS.minimumUserTurns) {
    return {
      quality: 'no_substance',
      reason: `Only ${userTurns} user turns. Need at least ${SCORING_THRESHOLDS.minimumUserTurns} exchanges for evaluation.`,
    }
  }

  if (userWordCount < SCORING_THRESHOLDS.minimumUserWords) {
    return {
      quality: 'no_substance',
      reason: `Only ${userWordCount} words spoken. Need at least ${SCORING_THRESHOLDS.minimumUserWords} words for meaningful feedback.`,
    }
  }

  return { quality: 'sufficient' }
}

function buildScoringPrompt(transcript: TranscriptEntry[], scenarioType: string): string {
  const transcriptText = transcript
    .map(t => `${t.role === 'user' ? 'SALESPERSON' : 'PROSPECT'}: ${t.content}`)
    .join('\n')

  return `You are an expert sales coach evaluating a cold call roleplay based EXACTLY on the Cold Calling Wiki methodology (coldcallingwiki.com).

SCENARIO TYPE: ${scenarioType}

TRANSCRIPT:
${transcriptText}

---

Analyze this call using the Cold Calling Wiki framework. Score each dimension 0-10 based on these EXACT criteria:

## 1. OPENER (Weight: 15%)
Wiki URL: coldcallingwiki.com/docs/openers
- Permission-Based: Did they use a PBO? ("Can you help me understand...", "Let me have 30 seconds")
- Attention Grab: Honesty/humor? ("I'll be upfront, it's a dreaded cold call")
- Time Expectation: Clear timeframe? ("30 seconds")
- Tone: Warm, not pushy?

## 2. PITCH (Weight: 15%)
Wiki URL: coldcallingwiki.com/docs/the-pitch
- Problem-Focused: Led with problems, not features? (Wiki: "Humans are 2x more likely to fix problems than gain benefits")
- ICP Clarity: Identified target clearly? ("Our clients are {ICP} who face...")
- Template Structure: Used problem+consequence format?
- Negative Close: "I have a feeling you'll tell me you have the opposite problem..."

## 3. DISCOVERY (Weight: 25%)
Wiki URL: coldcallingwiki.com/docs/qualifying-questions
- Got Example: Asked for specific examples?
- Explored Consequences: Without using the word "impact" (too salesy)
- Root Cause: "How long has this been going on?"
- Stayed on Problem: Didn't rush to pitch the solution?

## 4. OBJECTION HANDLING (Weight: 20%)
Wiki URL: coldcallingwiki.com/docs/objections-wiki
Framework: PAUSE → ACCEPT → ASK PERMISSION
- Paused: 2-3 second pause before responding?
- Acknowledged: "I thought you might say that", "I understand"
- Permission: "Do you mind if I ask a question about that?"
- Tonality: Calm, Curious, Cool (NOT defensive or sarcastic)

## 5. CLOSING (Weight: 15%)
Wiki URL: coldcallingwiki.com/docs/closing
- Summarized: Recapped what prospect said?
- Tested Emotion: "How does this make you feel?" / "Have you given up?"
- Negative Frame: "Would it be a bad idea to..." (NO makes people feel safe)
- Avoided Triggers: No "meeting", "demo", "calendar", "discovery"

## 6. COMMUNICATION (Weight: 10%)
Wiki URLs: coldcallingwiki.com/docs/tonality, coldcallingwiki.com/docs/active-listening
- Talk Ratio: Listened more than talked? (target: <40%)
- Filler Words: Minimal "um", "uh", "like"?
- Pace: Appropriate speed?
- Clarity: Clear, not sarcastic/aggressive?

IMPORTANT SCORING RULES:
- Score 1-2: Technique not present at all or done completely wrong
- Score 3-4: Weak attempt, major issues
- Score 5-6: Average, some elements present but inconsistent
- Score 7-8: Good execution with minor improvements needed
- Score 9-10: Excellent, textbook Wiki execution

BE REALISTIC: A 10-second call saying "hi" is a 1/10, not 3.8/10. Score based on what was ACTUALLY demonstrated.

Respond ONLY with valid JSON in this exact format:
{
  "opener": {
    "score": <number 0-10>,
    "feedback": "<2-3 sentences referencing Wiki methodology>",
    "criteria_results": [
      {"name": "permission_based", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "attention_grab", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "clear_timeframe", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "tone_friendly", "passed": <boolean>, "note": "<specific observation>"}
    ]
  },
  "pitch": {
    "score": <number 0-10>,
    "feedback": "<2-3 sentences referencing Wiki methodology>",
    "criteria_results": [
      {"name": "problem_focused", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "specific_icp", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "used_template", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "negative_close", "passed": <boolean>, "note": "<specific observation>"}
    ]
  },
  "discovery": {
    "score": <number 0-10>,
    "feedback": "<2-3 sentences referencing Wiki methodology>",
    "criteria_results": [
      {"name": "got_example", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "understood_impact", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "found_root_cause", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "stayed_on_problem", "passed": <boolean>, "note": "<specific observation>"}
    ]
  },
  "objection_handling": {
    "score": <number 0-10>,
    "feedback": "<2-3 sentences referencing Wiki methodology>",
    "criteria_results": [
      {"name": "paused", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "acknowledged", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "asked_permission", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "calm_tonality", "passed": <boolean>, "note": "<specific observation>"}
    ]
  },
  "closing": {
    "score": <number 0-10>,
    "feedback": "<2-3 sentences referencing Wiki methodology>",
    "criteria_results": [
      {"name": "summarized", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "tested_emotion", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "negative_frame", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "avoided_triggers", "passed": <boolean>, "note": "<specific observation>"}
    ]
  },
  "communication": {
    "score": <number 0-10>,
    "feedback": "<2-3 sentences referencing Wiki methodology>",
    "criteria_results": [
      {"name": "talk_ratio", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "filler_words", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "pace", "passed": <boolean>, "note": "<specific observation>"},
      {"name": "clarity", "passed": <boolean>, "note": "<specific observation>"}
    ]
  },
  "overall_summary": "<3-4 sentences: what went well, what to work on, specific Wiki technique to practice>",
  "top_strengths": ["<strength 1 with Wiki reference>", "<strength 2>"],
  "priority_improvements": ["<improvement 1 with specific Wiki technique>", "<improvement 2>", "<improvement 3>"]
}`
}

function buildLowQualityResponse(
  quality: 'too_short' | 'no_substance',
  reason: string
): AIScoringResult {
  const baseScore = quality === 'too_short' ? 1 : 2
  const feedback = quality === 'too_short'
    ? 'Call too short to evaluate. Practice longer conversations to get meaningful feedback.'
    : 'Not enough substance to score. Try engaging more with the prospect.'

  const dimensions: ScoreDimension[] = [
    'opener', 'pitch', 'discovery', 'objection_handling', 'closing', 'communication'
  ]

  const dimensionScores: Record<ScoreDimension, DimensionScore> = {} as Record<ScoreDimension, DimensionScore>

  for (const dim of dimensions) {
    dimensionScores[dim] = {
      score: baseScore,
      feedback,
      criteria: [],
    }
  }

  return {
    overallScore: baseScore,
    dimensionScores,
    summary: reason,
    strengths: [],
    improvements: [
      'Practice longer conversations (at least 60 seconds)',
      'Focus on going through the full call structure',
      'Refer to coldcallingwiki.com/docs/call-structure for the complete flow',
    ],
    callQuality: quality,
  }
}

export async function analyzeTranscriptWithAI(input: AIScoringInput): Promise<AIScoringResult> {
  const { transcript, durationSeconds, scenarioType } = input

  // First check call quality
  const qualityCheck = assessCallQuality(transcript, durationSeconds)

  if (qualityCheck.quality !== 'sufficient') {
    logger.info('Call quality insufficient for AI scoring', {
      operation: 'analyzeTranscriptWithAI',
      quality: qualityCheck.quality,
      reason: qualityCheck.reason,
    })
    return buildLowQualityResponse(qualityCheck.quality, qualityCheck.reason!)
  }

  try {
    const prompt = buildScoringPrompt(transcript, scenarioType)

    const response = await callOpenRouter(
      [
        {
          role: 'system',
          content: 'You are an expert sales coach who scores calls based on Cold Calling Wiki methodology. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: 'openai/gpt-4o',
        temperature: 0.2, // Low temperature for consistent scoring
        maxTokens: 3000,
      }
    )

    // Parse the JSON response
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const analysis: AIAnalysisResponse = JSON.parse(cleanedResponse)

    // Convert to our format
    const dimensionScores: Record<ScoreDimension, DimensionScore> = {
      opener: convertDimensionAnalysis(analysis.opener),
      pitch: convertDimensionAnalysis(analysis.pitch),
      discovery: convertDimensionAnalysis(analysis.discovery),
      objection_handling: convertDimensionAnalysis(analysis.objection_handling),
      closing: convertDimensionAnalysis(analysis.closing),
      communication: convertDimensionAnalysis(analysis.communication),
    }

    // Calculate weighted overall score
    const weights = {
      opener: 0.15,
      pitch: 0.15,
      discovery: 0.25,
      objection_handling: 0.20,
      closing: 0.15,
      communication: 0.10,
    }

    let overallScore = 0
    for (const [dim, weight] of Object.entries(weights)) {
      overallScore += dimensionScores[dim as ScoreDimension].score * weight
    }
    overallScore = Math.round(overallScore * 10) / 10

    return {
      overallScore,
      dimensionScores,
      summary: analysis.overall_summary,
      strengths: analysis.top_strengths.slice(0, 5),
      improvements: analysis.priority_improvements.slice(0, 5),
      callQuality: 'sufficient',
    }
  } catch (error) {
    logger.exception('AI scoring failed, falling back to rule-based', error, {
      operation: 'analyzeTranscriptWithAI',
    })

    // Fall back to basic rule-based scoring if AI fails
    const { analyzeTranscript } = await import('@/lib/scoring/engine')
    const fallbackResult = analyzeTranscript(input)

    return {
      ...fallbackResult,
      callQuality: 'sufficient',
    }
  }
}

function convertDimensionAnalysis(analysis: DimensionAnalysis): DimensionScore {
  return {
    score: Math.max(0, Math.min(10, analysis.score)), // Clamp 0-10
    feedback: analysis.feedback,
    criteria: analysis.criteria_results.map(cr => ({
      name: cr.name,
      passed: cr.passed,
      note: cr.note,
    })),
  }
}
