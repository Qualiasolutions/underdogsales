'use client'

import { motion } from 'framer-motion'
import { Trophy, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackListProps {
  title: string
  items: string[]
  variant: 'strengths' | 'improvements'
  maxItems?: number
}

export function FeedbackList({
  title,
  items,
  variant,
  maxItems = 5,
}: FeedbackListProps) {
  const isStrengths = variant === 'strengths'
  const displayItems = items.slice(0, maxItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-2xl border p-6',
        isStrengths ? 'border-emerald-200' : 'border-amber-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            isStrengths ? 'bg-emerald-100' : 'bg-amber-100'
          )}
        >
          {isStrengths ? (
            <Trophy className="w-5 h-5 text-emerald-600" />
          ) : (
            <Target className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-navy">{title}</h3>
      </div>

      {/* List */}
      {displayItems.length > 0 ? (
        <ul className="space-y-3">
          {displayItems.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 text-sm"
            >
              <span
                className={cn(
                  'font-bold flex-shrink-0',
                  isStrengths ? 'text-emerald-600' : 'text-amber-600'
                )}
              >
                {i + 1}.
              </span>
              <span className="text-muted-foreground">{item}</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No {variant} identified
        </p>
      )}
    </motion.div>
  )
}
