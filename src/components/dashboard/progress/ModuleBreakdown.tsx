'use client'

import { motion } from 'motion/react'
import { CheckCircle, Circle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRICULUM_MODULES } from '@/config/curriculum'

interface ModuleProgress {
  moduleId: number
  completed: boolean
  score: number | null
  completedAt: string | null
}

interface ModuleBreakdownProps {
  progress: ModuleProgress[]
  className?: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ModuleBreakdown({ progress, className }: ModuleBreakdownProps) {
  // Create a map for quick lookup
  const progressMap = new Map(progress.map((p) => [p.moduleId, p]))

  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      }}
    >
      {CURRICULUM_MODULES.map((module) => {
        const moduleProgress = progressMap.get(module.id)
        const isCompleted = moduleProgress?.completed ?? false
        const score = moduleProgress?.score
        const completedAt = moduleProgress?.completedAt

        return (
          <motion.div
            key={module.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg transition-colors',
              isCompleted ? 'bg-success/5' : 'bg-muted/50'
            )}
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium text-sm truncate',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {module.name}
                  </span>
                  {!isCompleted && module.id <= 3 && (
                    <BookOpen className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {isCompleted && score !== null && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gold/10 text-gold-dark">
                  {score}/10
                </span>
              )}
              {isCompleted && completedAt && (
                <span className="text-xs text-muted-foreground">{formatDate(completedAt)}</span>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
