import { describe, it, expect } from 'vitest'
import { analyzeTranscript, type ScoringInput } from '@/lib/scoring/engine'
import { calculateOverallScore, getScoreLabel } from '@/config/rubric'

describe('Scoring Engine', () => {
  describe('analyzeTranscript', () => {
    it('should return a valid scoring result', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: 'Hello?', timestamp: 0 },
          {
            role: 'user',
            content: "Hi, I'll be upfront, this is a cold call. Do you mind if I have 30 seconds?",
            timestamp: 1000,
          },
          { role: 'assistant', content: 'Sure, go ahead.', timestamp: 2000 },
          {
            role: 'user',
            content: 'We work with ambitious sales leaders who struggle with unpredictable pipeline. Is that something you deal with?',
            timestamp: 3000,
          },
        ],
        durationSeconds: 60,
        scenarioType: 'cold_call',
      }

      const result = analyzeTranscript(input)

      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(10)
      expect(result.dimensionScores).toBeDefined()
      expect(result.dimensionScores.opener).toBeDefined()
      expect(result.dimensionScores.pitch).toBeDefined()
      expect(result.summary).toBeDefined()
    })

    it('should score permission-based openers highly', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: 'Hello?', timestamp: 0 },
          {
            role: 'user',
            content: "Hi Sarah, I'll be completely honest, this is a cold call. Can I have 30 seconds to explain?",
            timestamp: 1000,
          },
        ],
        durationSeconds: 15,
        scenarioType: 'cold_call',
      }

      const result = analyzeTranscript(input)

      // Should score well on opener due to permission-based approach
      expect(result.dimensionScores.opener.score).toBeGreaterThanOrEqual(5)
      expect(result.dimensionScores.opener.criteria.some(c => c.name === 'permission_based' && c.passed)).toBe(true)
    })

    it('should detect when someone rushes to solution', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: 'What is this about?', timestamp: 0 },
          {
            role: 'user',
            content: 'Our solution does amazing things! Let me show you a demo of our product features.',
            timestamp: 1000,
          },
        ],
        durationSeconds: 20,
        scenarioType: 'cold_call',
      }

      const result = analyzeTranscript(input)

      // Should score poorly on discovery for rushing to solution
      expect(result.dimensionScores.discovery.criteria.some(c => c.name === 'stayed_on_problem' && !c.passed)).toBe(true)
    })

    it('should reward negative framing in closing', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: "You've given me a lot to think about.", timestamp: 0 },
          {
            role: 'user',
            content: "Based on what you told me, I'm not 100% sure we can help. Would it be a bad idea to sit down and explore this further?",
            timestamp: 1000,
          },
        ],
        durationSeconds: 30,
        scenarioType: 'closing',
      }

      const result = analyzeTranscript(input)

      // Should detect negative framing
      expect(result.dimensionScores.closing.criteria.some(c => c.name === 'negative_frame' && c.passed)).toBe(true)
    })

    it('should penalize trigger words in closing', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: 'OK', timestamp: 0 },
          {
            role: 'user',
            content: "Let's book a meeting. I'll send you a calendar invite for a demo.",
            timestamp: 1000,
          },
        ],
        durationSeconds: 15,
        scenarioType: 'closing',
      }

      const result = analyzeTranscript(input)

      // Should fail avoided_triggers criterion
      expect(result.dimensionScores.closing.criteria.some(c => c.name === 'avoided_triggers' && !c.passed)).toBe(true)
    })

    it('should detect filler words', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: 'Tell me more.', timestamp: 0 },
          {
            role: 'user',
            content: 'Um, so like, you know, basically we um help companies with like, you know, their sales stuff.',
            timestamp: 1000,
          },
        ],
        durationSeconds: 20,
        scenarioType: 'cold_call',
      }

      const result = analyzeTranscript(input)

      // Should fail filler_words criterion
      expect(result.dimensionScores.communication.criteria.some(c => c.name === 'filler_words' && !c.passed)).toBe(true)
    })

    it('should provide improvement suggestions', () => {
      const input: ScoringInput = {
        transcript: [
          { role: 'assistant', content: 'Not interested.', timestamp: 0 },
          { role: 'user', content: 'But wait, our product is great!', timestamp: 1000 },
        ],
        durationSeconds: 10,
        scenarioType: 'objection',
      }

      const result = analyzeTranscript(input)

      expect(result.improvements.length).toBeGreaterThan(0)
    })
  })

  describe('calculateOverallScore', () => {
    it('should calculate weighted average correctly', () => {
      const scores = {
        opener: 8,
        pitch: 7,
        discovery: 9,
        objection_handling: 6,
        closing: 7,
        communication: 8,
      }

      const overall = calculateOverallScore(scores)

      // Should be between min and max of individual scores
      expect(overall).toBeGreaterThanOrEqual(6)
      expect(overall).toBeLessThanOrEqual(9)
    })

    it('should handle missing dimensions', () => {
      const scores = {
        opener: 8,
        pitch: 7,
      } as Record<string, number>

      const overall = calculateOverallScore(scores as Parameters<typeof calculateOverallScore>[0])

      expect(overall).toBeGreaterThan(0)
    })
  })

  describe('getScoreLabel', () => {
    it('should return correct labels', () => {
      expect(getScoreLabel(9.5)).toBe('Excellent')
      expect(getScoreLabel(8)).toBe('Good')
      expect(getScoreLabel(6)).toBe('Average')
      expect(getScoreLabel(4)).toBe('Needs Work')
      expect(getScoreLabel(2)).toBe('Poor')
    })
  })
})
