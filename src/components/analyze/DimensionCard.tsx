'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScoreDimension, DimensionScore } from '@/types'
import { getScoreColor, getScoreLabel } from '@/config/rubric'

interface DimensionCardProps {
  dimension: ScoreDimension
  score: DimensionScore
  weight: number
}

const DIMENSION_LABELS: Record<ScoreDimension, string> = {
  opener: 'Opener',
  pitch: 'Pitch',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  closing: 'Closing',
  communication: 'Communication',
}

export function DimensionCard({ dimension, score, weight }: DimensionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const scoreColor = getScoreColor(score.score)
  const passedCount = score.criteria.filter((c) => c.passed).length
  const totalCount = score.criteria.length

  return (
    <motion.div
      className={cn(
        'bg-white rounded-2xl border border-border p-5 transition-shadow cursor-pointer',
        'hover:shadow-md'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-navy">
            {DIMENSION_LABELS[dimension]}
          </h4>
          <p className="text-xs text-muted-foreground">
            Weight: {Math.round(weight * 100)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold', scoreColor)}>
            {score.score}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-gold to-gold-light"
          initial={{ width: 0 }}
          animate={{ width: `${(score.score / 10) * 100}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {score.feedback}
      </p>

      {/* Expand button */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {passedCount}/{totalCount} criteria passed
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Expanded criteria list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border mt-4 pt-4 space-y-3">
              {score.criteria.map((criterion) => (
                <div
                  key={criterion.name}
                  className="flex items-start gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {criterion.passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy capitalize">
                      {criterion.name.replace(/_/g, ' ')}
                    </p>
                    {criterion.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {criterion.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
