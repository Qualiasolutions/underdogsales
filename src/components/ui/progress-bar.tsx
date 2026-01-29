'use client'

import { forwardRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// Simple Progress Bar
interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'gold' | 'success' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      showLabel = false,
      animated = true,
      className,
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    const variantClasses = {
      default: 'bg-navy dark:bg-gold',
      gold: 'bg-gradient-to-r from-gold to-gold-light',
      success: 'bg-success',
      gradient: 'bg-gradient-to-r from-gold via-gold-light to-gold',
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
          <motion.div
            className={cn('h-full rounded-full', variantClasses[variant])}
            initial={animated ? { width: 0 } : false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'

// Multi-Step Progress
interface Step {
  label: string
  description?: string
}

interface MultiStepProgressProps {
  steps: Step[]
  currentStep: number
  variant?: 'default' | 'gold'
  className?: string
}

export function MultiStepProgress({
  steps,
  currentStep,
  variant = 'gold',
  className,
}: MultiStepProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                    isCompleted && variant === 'gold' && 'bg-gold text-foreground',
                    isCompleted && variant === 'default' && 'bg-navy text-white dark:bg-gold dark:text-foreground',
                    isCurrent && 'bg-gold/20 text-gold-dark border-2 border-gold',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                  initial={isCompleted ? { scale: 0.8 } : false}
                  animate={isCompleted ? { scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    index + 1
                  )}
                </motion.div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px]',
                    (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground text-center max-w-[100px] mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-3 mt-[-24px] bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      variant === 'gold' ? 'bg-gold' : 'bg-navy dark:bg-gold'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Circular Progress
interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'gold' | 'success'
  showLabel?: boolean
  label?: string
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'gold',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const strokeColors = {
    default: 'stroke-navy dark:stroke-gold',
    gold: 'stroke-gold',
    success: 'stroke-success',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={strokeColors[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * percentage) / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  )
}
