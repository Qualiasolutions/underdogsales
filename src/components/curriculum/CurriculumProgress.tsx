'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CheckCircle, Trophy, Star } from 'lucide-react'

interface OverallProgressBarProps {
  completed: number
  total: number
  className?: string
}

export function OverallProgressBar({ completed, total, className }: OverallProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {percentage === 100 ? (
            <Trophy className="w-5 h-5 text-gold" />
          ) : (
            <Star className="w-5 h-5 text-gold" />
          )}
          <span className="text-sm font-medium text-foreground">
            {percentage === 100 ? 'Curriculum Complete!' : 'Your Progress'}
          </span>
        </div>
        <span className="text-sm font-bold text-foreground">
          {completed} / {total} modules
        </span>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(percentage)}% complete</span>
        {completed > 0 && percentage < 100 && (
          <span>{total - completed} modules remaining</span>
        )}
      </div>
    </div>
  )
}

interface ModuleProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ModuleProgressRing({ progress, size = 'md', className }: ModuleProgressRingProps) {
  const sizes = {
    sm: { width: 40, strokeWidth: 4 },
    md: { width: 56, strokeWidth: 5 },
    lg: { width: 72, strokeWidth: 6 },
  }

  const { width, strokeWidth } = sizes[size]
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={width} height={width} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--underdog-gold)" />
            <stop offset="100%" stopColor="var(--underdog-gold-light)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-bold text-foreground">{Math.round(progress)}%</span>
    </div>
  )
}

interface CompletionBadgeProps {
  className?: string
}

export function CompletionBadge({ className }: CompletionBadgeProps) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-light text-success text-sm font-medium',
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <CheckCircle className="w-4 h-4" />
      <span>Completed</span>
    </motion.div>
  )
}

interface CurriculumStatsProps {
  completed: number
  total: number
  className?: string
}

export function CurriculumStats({ completed, total, className }: CurriculumStatsProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      <div className="text-center p-4 bg-muted rounded-xl">
        <p className="text-2xl font-bold text-foreground">{completed}</p>
        <p className="text-xs text-muted-foreground">Completed</p>
      </div>
      <div className="text-center p-4 bg-muted rounded-xl">
        <p className="text-2xl font-bold text-foreground">{total - completed}</p>
        <p className="text-xs text-muted-foreground">Remaining</p>
      </div>
      <div className="text-center p-4 bg-gold/10 rounded-xl">
        <p className="text-2xl font-bold text-gold-dark">{percentage}%</p>
        <p className="text-xs text-muted-foreground">Progress</p>
      </div>
    </div>
  )
}
