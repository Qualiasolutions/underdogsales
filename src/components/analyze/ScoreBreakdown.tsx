'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { CallAnalysis, ScoreDimension } from '@/types'
import { getScoreLabel, getScoreColor, SCORING_RUBRIC } from '@/config/rubric'
import { DimensionCard } from './DimensionCard'
import { FeedbackList } from './FeedbackList'

interface ScoreBreakdownProps {
  analysis: CallAnalysis
  overallScore: number
}

const DIMENSION_ORDER: ScoreDimension[] = [
  'opener',
  'pitch',
  'discovery',
  'objection_handling',
  'closing',
  'communication',
]

export function ScoreBreakdown({ analysis, overallScore }: ScoreBreakdownProps) {
  const scoreLabel = getScoreLabel(overallScore)
  const scoreColor = getScoreColor(overallScore)

  return (
    <div className="space-y-8">
      {/* Overall Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-border p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={283}
                  initial={{ strokeDashoffset: 283 }}
                  animate={{
                    strokeDashoffset: 283 - (283 * overallScore) / 10,
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#E7B221" />
                    <stop offset="100%" stopColor="#F5D75B" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-4xl font-bold text-navy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {overallScore.toFixed(1)}
                </motion.span>
                <span className="text-sm text-muted-foreground">/ 10</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1 text-center md:text-left">
            <h2 className={cn('text-2xl font-bold mb-2', scoreColor)}>
              {scoreLabel}
            </h2>
            <p className="text-muted-foreground">{analysis.summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackList
          title="Strengths"
          items={analysis.strengths}
          variant="strengths"
        />
        <FeedbackList
          title="Areas for Improvement"
          items={analysis.improvements}
          variant="improvements"
        />
      </div>

      {/* Dimension Breakdown */}
      <div>
        <h3 className="text-xl font-bold text-navy mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSION_ORDER.map((dimension, index) => {
            const score = analysis.scores[dimension]
            const rubric = SCORING_RUBRIC.find((r) => r.dimension === dimension)
            if (!score || !rubric) return null

            return (
              <motion.div
                key={dimension}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <DimensionCard
                  dimension={dimension}
                  score={score}
                  weight={rubric.weight}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
