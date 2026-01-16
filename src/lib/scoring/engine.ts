import type { TranscriptEntry, ScoreDimension, DimensionScore, CriterionResult } from '@/types'
import { SCORING_RUBRIC, calculateOverallScore } from '@/config/rubric'

export interface ScoringInput {
  transcript: TranscriptEntry[]
  durationSeconds: number
  scenarioType: string
}

export interface ScoringResult {
  overallScore: number
  dimensionScores: Record<ScoreDimension, DimensionScore>
  summary: string
  strengths: string[]
  improvements: string[]
}

export function analyzeTranscript(input: ScoringInput): ScoringResult {
  const { transcript, durationSeconds } = input

  const userMessages = transcript.filter((t) => t.role === 'user')
  const assistantMessages = transcript.filter((t) => t.role === 'assistant')

  const userWordCount = countWords(userMessages.map((m) => m.content).join(' '))
  const totalWordCount = countWords(transcript.map((m) => m.content).join(' '))
  const talkRatio = totalWordCount > 0 ? userWordCount / totalWordCount : 0

  const fullText = transcript.map((m) => m.content).join(' ')
  const userText = userMessages.map((m) => m.content).join(' ')

  const dimensionScores: Record<ScoreDimension, DimensionScore> = {
    opener: analyzeOpener(userText, userMessages),
    pitch: analyzePitch(userText),
    discovery: analyzeDiscovery(fullText, userMessages),
    objection_handling: analyzeObjectionHandling(fullText, transcript),
    closing: analyzeClosing(userText),
    communication: analyzeCommunication(userText, talkRatio, durationSeconds),
  }

  const overallScore = calculateOverallScore(
    Object.fromEntries(
      Object.entries(dimensionScores).map(([k, v]) => [k, v.score])
    ) as Record<ScoreDimension, number>
  )

  const { strengths, improvements } = generateFeedbackLists(dimensionScores)

  return {
    overallScore,
    dimensionScores,
    summary: generateSummary(overallScore, dimensionScores),
    strengths,
    improvements,
  }
}

function analyzeOpener(userText: string, userMessages: TranscriptEntry[]): DimensionScore {
  const firstUserMessage = userMessages[0]?.content.toLowerCase() || ''
  const criteria: CriterionResult[] = []

  // Permission-based check
  const permissionPhrases = [
    'do you mind', 'would you', 'can i', 'may i', 'is this a good time',
    'let me have', 'give me', 'help me', '30 seconds', 'quick question'
  ]
  const hasPermission = permissionPhrases.some((p) => firstUserMessage.includes(p))
  criteria.push({
    name: 'permission_based',
    passed: hasPermission,
    note: hasPermission ? 'Good use of permission-based opener' : 'Consider asking for permission early',
  })

  // Attention grab
  const attentionPhrases = ['cold call', 'honest', 'upfront', 'won\'t take long', 'quick']
  const hasAttention = attentionPhrases.some((p) => firstUserMessage.includes(p))
  criteria.push({
    name: 'attention_grab',
    passed: hasAttention,
    note: hasAttention ? 'Effective attention-grabbing opener' : 'Try using honesty or humor to grab attention',
  })

  // Clear timeframe
  const timeframePhrases = ['30 seconds', 'minute', 'quick', 'brief', 'short']
  const hasTimeframe = timeframePhrases.some((p) => firstUserMessage.includes(p))
  criteria.push({
    name: 'clear_timeframe',
    passed: hasTimeframe,
    note: hasTimeframe ? 'Good time expectation setting' : 'Set a clear time expectation',
  })

  // Friendly tone (absence of negative indicators)
  const aggressivePhrases = ['you need', 'you must', 'you have to', 'listen']
  const isNotAggressive = !aggressivePhrases.some((p) => firstUserMessage.includes(p))
  criteria.push({
    name: 'tone_friendly',
    passed: isNotAggressive,
    note: isNotAggressive ? 'Appropriate tone' : 'Tone came across as pushy',
  })

  const score = calculateDimensionScore(criteria)
  return {
    score,
    feedback: generateDimensionFeedback('opener', criteria, score),
    criteria,
  }
}

function analyzePitch(userText: string): DimensionScore {
  const textLower = userText.toLowerCase()
  const criteria: CriterionResult[] = []

  // Problem-focused
  const problemPhrases = ['problem', 'challenge', 'struggle', 'issue', 'obstacle', 'frustrat']
  const hasProblemFocus = problemPhrases.some((p) => textLower.includes(p))
  criteria.push({
    name: 'problem_focused',
    passed: hasProblemFocus,
    note: hasProblemFocus ? 'Good focus on problems' : 'Lead with problems, not features',
  })

  // Feature-focused (negative indicator)
  const featurePhrases = ['our software', 'our product', 'we offer', 'features include', 'our solution does']
  const hasFeatureFocus = featurePhrases.some((p) => textLower.includes(p))
  criteria.push({
    name: 'specific_icp',
    passed: !hasFeatureFocus,
    note: hasFeatureFocus ? 'Too focused on your product features' : 'Good balance',
  })

  // Used template structure
  const templateIndicators = ['clients', 'typically', 'usually', 'work with', 'help']
  const usedTemplate = templateIndicators.filter((p) => textLower.includes(p)).length >= 2
  criteria.push({
    name: 'used_template',
    passed: usedTemplate,
    note: usedTemplate ? 'Good pitch structure' : 'Try using the problem-based pitch template',
  })

  // Negative close in pitch
  const negativePhrases = ['opposite problem', 'have a feeling', 'probably tell me', 'guess you']
  const hasNegativeClose = negativePhrases.some((p) => textLower.includes(p))
  criteria.push({
    name: 'negative_close',
    passed: hasNegativeClose,
    note: hasNegativeClose ? 'Nice use of negative framing' : 'Try "I have a feeling you\'ll tell me..."',
  })

  const score = calculateDimensionScore(criteria)
  return {
    score,
    feedback: generateDimensionFeedback('pitch', criteria, score),
    criteria,
  }
}

function analyzeDiscovery(fullText: string, userMessages: TranscriptEntry[]): DimensionScore {
  const textLower = fullText.toLowerCase()
  const userTextLower = userMessages.map((m) => m.content.toLowerCase()).join(' ')
  const criteria: CriterionResult[] = []

  // Got example
  const examplePhrases = ['example', 'instance', 'specific', 'what does that look like', 'in your world']
  const askedForExample = examplePhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'got_example',
    passed: askedForExample,
    note: askedForExample ? 'Good job asking for an example' : 'Always ask for a concrete example',
  })

  // Understood impact (without saying "impact")
  const impactPhrases = ['what would happen', 'what does that mean', 'affect', 'consequence', 'result in']
  const usedImpactWord = textLower.includes('impact')
  const exploredImpact = impactPhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'understood_impact',
    passed: exploredImpact && !usedImpactWord,
    note: usedImpactWord
      ? 'Avoid the word "impact" - too salesy'
      : exploredImpact
        ? 'Good exploration of consequences'
        : 'Ask about what this means for them',
  })

  // Found root cause
  const rootCausePhrases = ['how long', 'where does', 'why do you think', 'tried to fix', 'what have you done']
  const exploredRootCause = rootCausePhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'found_root_cause',
    passed: exploredRootCause,
    note: exploredRootCause ? 'Good root cause exploration' : 'Dig into where the problem comes from',
  })

  // Stayed on problem (didn't rush to solution)
  const solutionPhrases = ['our solution', 'we can fix', 'let me show you', 'our product', 'demo']
  const rushedToSolution = solutionPhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'stayed_on_problem',
    passed: !rushedToSolution,
    note: rushedToSolution ? 'Don\'t rush to the solution - stay on the problem' : 'Good problem focus',
  })

  const score = calculateDimensionScore(criteria)
  return {
    score,
    feedback: generateDimensionFeedback('discovery', criteria, score),
    criteria,
  }
}

function analyzeObjectionHandling(fullText: string, transcript: TranscriptEntry[]): DimensionScore {
  const userTextLower = transcript.filter((t) => t.role === 'user').map((m) => m.content.toLowerCase()).join(' ')
  const criteria: CriterionResult[] = []

  // Check for pausing (hard to detect in text, use proxy of short responses after objections)
  // This is a simplified heuristic
  criteria.push({
    name: 'paused',
    passed: true, // Default to pass as we can't accurately measure pause in text
    note: 'Remember to pause 2-3 seconds before responding to objections',
  })

  // Acknowledged objection
  const acknowledgePhrases = ['i understand', 'i thought you might', 'that makes sense', 'i hear you', 'fair enough']
  const acknowledged = acknowledgePhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'acknowledged',
    passed: acknowledged,
    note: acknowledged ? 'Good objection acknowledgment' : 'Acknowledge objections before probing',
  })

  // Asked permission
  const permissionPhrases = ['do you mind if', 'can i ask', 'would it be okay', 'one last question']
  const askedPermission = permissionPhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'asked_permission',
    passed: askedPermission,
    note: askedPermission ? 'Good use of permission before probing' : 'Ask permission before deeper questions',
  })

  // Calm tonality (absence of defensive language)
  const defensivePhrases = ['but we', 'no, you\'re wrong', 'actually', 'you don\'t understand']
  const wasDefensive = defensivePhrases.some((p) => userTextLower.includes(p))
  criteria.push({
    name: 'calm_tonality',
    passed: !wasDefensive,
    note: wasDefensive ? 'Stay curious, not defensive' : 'Good calm approach',
  })

  const score = calculateDimensionScore(criteria)
  return {
    score,
    feedback: generateDimensionFeedback('objection_handling', criteria, score),
    criteria,
  }
}

function analyzeClosing(userText: string): DimensionScore {
  const textLower = userText.toLowerCase()
  const criteria: CriterionResult[] = []

  // Summarized
  const summaryPhrases = ['let me see if i got', 'so you mentioned', 'to summarize', 'you told me']
  const summarized = summaryPhrases.some((p) => textLower.includes(p))
  criteria.push({
    name: 'summarized',
    passed: summarized,
    note: summarized ? 'Good summary of key points' : 'Summarize what they told you before closing',
  })

  // Tested emotion
  const emotionPhrases = ['how does that make you feel', 'given up', 'accepted', 'frustrated']
  const testedEmotion = emotionPhrases.some((p) => textLower.includes(p))
  criteria.push({
    name: 'tested_emotion',
    passed: testedEmotion,
    note: testedEmotion ? 'Good emotional check' : 'Ask how they feel about the problem',
  })

  // Negative framing
  const negativePhrases = ['would it be a bad idea', 'would you be against', 'wouldn\'t make sense']
  const usedNegativeFrame = negativePhrases.some((p) => textLower.includes(p))
  criteria.push({
    name: 'negative_frame',
    passed: usedNegativeFrame,
    note: usedNegativeFrame ? 'Excellent use of negative framing' : 'Try "Would it be a bad idea to..."',
  })

  // Avoided trigger words
  const triggerWords = ['meeting', 'calendar', 'demo', 'discovery']
  const usedTriggers = triggerWords.some((p) => textLower.includes(p))
  criteria.push({
    name: 'avoided_triggers',
    passed: !usedTriggers,
    note: usedTriggers ? 'Avoid trigger words: meeting, demo, calendar' : 'Good word choices',
  })

  const score = calculateDimensionScore(criteria)
  return {
    score,
    feedback: generateDimensionFeedback('closing', criteria, score),
    criteria,
  }
}

function analyzeCommunication(
  userText: string,
  talkRatio: number,
  durationSeconds: number
): DimensionScore {
  const criteria: CriterionResult[] = []

  // Talk ratio (target <40%)
  const goodTalkRatio = talkRatio < 0.4
  criteria.push({
    name: 'talk_ratio',
    passed: goodTalkRatio,
    note: `Talk ratio: ${Math.round(talkRatio * 100)}%. ${goodTalkRatio ? 'Good listening!' : 'Try to listen more (target: <40%)'}`,
  })

  // Filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'sort of', 'kind of']
  const textLower = userText.toLowerCase()
  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    return count + (textLower.match(regex)?.length || 0)
  }, 0)
  const wordCount = countWords(userText)
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0
  const lowFillers = fillerRatio < 0.02 // Less than 2% filler words
  criteria.push({
    name: 'filler_words',
    passed: lowFillers,
    note: lowFillers ? 'Minimal filler words' : 'Reduce filler words (um, uh, like)',
  })

  // Pace (words per minute)
  const wpm = durationSeconds > 0 ? (wordCount / durationSeconds) * 60 : 0
  const goodPace = wpm >= 120 && wpm <= 160
  criteria.push({
    name: 'pace',
    passed: goodPace,
    note: `Speaking pace: ~${Math.round(wpm)} WPM. ${goodPace ? 'Good pace!' : wpm < 120 ? 'Try speaking a bit faster' : 'Slow down a bit'}`,
  })

  // Clarity (sentence length as proxy)
  const sentences = userText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0
  const goodClarity = avgSentenceLength <= 20
  criteria.push({
    name: 'clarity',
    passed: goodClarity,
    note: goodClarity ? 'Clear, concise sentences' : 'Try shorter, clearer sentences',
  })

  const score = calculateDimensionScore(criteria)
  return {
    score,
    feedback: generateDimensionFeedback('communication', criteria, score),
    criteria,
  }
}

function calculateDimensionScore(criteria: CriterionResult[]): number {
  if (criteria.length === 0) return 5
  const passedCount = criteria.filter((c) => c.passed).length
  return Math.round((passedCount / criteria.length) * 10)
}

function generateDimensionFeedback(
  dimension: ScoreDimension,
  criteria: CriterionResult[],
  score: number
): string {
  const passed = criteria.filter((c) => c.passed)
  const failed = criteria.filter((c) => !c.passed)

  if (score >= 8) {
    return `Excellent ${dimension.replace('_', ' ')}! ${passed.map((c) => c.note).join(' ')}`
  } else if (score >= 6) {
    return `Good ${dimension.replace('_', ' ')}. ${failed.length > 0 ? `Focus on: ${failed[0].note}` : ''}`
  } else {
    return `${dimension.replace('_', ' ')} needs work. ${failed.slice(0, 2).map((c) => c.note).join('. ')}`
  }
}

function generateFeedbackLists(
  scores: Record<ScoreDimension, DimensionScore>
): { strengths: string[]; improvements: string[] } {
  const strengths: string[] = []
  const improvements: string[] = []

  for (const [dimension, score] of Object.entries(scores)) {
    const passedCriteria = score.criteria.filter((c) => c.passed)
    const failedCriteria = score.criteria.filter((c) => !c.passed)

    if (score.score >= 7) {
      passedCriteria.forEach((c) => {
        if (c.note && !c.note.includes('Default')) {
          strengths.push(c.note)
        }
      })
    }

    if (score.score < 7) {
      failedCriteria.forEach((c) => {
        if (c.note) {
          improvements.push(c.note)
        }
      })
    }
  }

  return {
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
  }
}

function generateSummary(
  overallScore: number,
  scores: Record<ScoreDimension, DimensionScore>
): string {
  const sortedDimensions = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score)

  const bestDimension = sortedDimensions[0]
  const worstDimension = sortedDimensions[sortedDimensions.length - 1]

  if (overallScore >= 8) {
    return `Excellent call! Your strongest area was ${bestDimension[0].replace('_', ' ')}. Keep up the great work.`
  } else if (overallScore >= 6) {
    return `Solid performance. Your ${bestDimension[0].replace('_', ' ')} was strong. Focus on improving your ${worstDimension[0].replace('_', ' ')} next time.`
  } else {
    return `Keep practicing! Focus on ${worstDimension[0].replace('_', ' ')} as your priority area for improvement.`
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length
}
