'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-navy/10 text-foreground',
        gold: 'bg-gold/15 text-gold-dark',
        navy: 'bg-navy text-white',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        error: 'bg-error-light text-error',
        outline: 'border-2 border-navy/20 text-foreground bg-transparent',
        gradient: 'bg-gradient-to-r from-gold to-gold-light text-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-md',
        md: 'px-3 py-1 text-sm rounded-lg',
        lg: 'px-4 py-1.5 text-sm rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  pulse?: boolean
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, pulse, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'error' && 'bg-error',
          variant === 'gold' && 'bg-gold-dark',
          variant === 'navy' && 'bg-card',
          (!variant || variant === 'default' || variant === 'outline') && 'bg-navy',
          pulse && 'animate-pulse'
        )} />
      )}
      {children}
    </span>
  )
)
Badge.displayName = 'Badge'

// Score Badge - For displaying scores with color coding
interface ScoreBadgeProps extends Omit<BadgeProps, 'variant'> {
  score: number
  max?: number
}

const ScoreBadge = forwardRef<HTMLSpanElement, ScoreBadgeProps>(
  ({ score, max = 10, className, ...props }, ref) => {
    const percentage = (score / max) * 100
    let variant: BadgeProps['variant'] = 'default'

    if (percentage >= 80) variant = 'success'
    else if (percentage >= 60) variant = 'gold'
    else if (percentage >= 40) variant = 'warning'
    else variant = 'error'

    return (
      <Badge ref={ref} variant={variant} className={cn('font-mono', className)} {...props}>
        {score.toFixed(1)}/{max}
      </Badge>
    )
  }
)
ScoreBadge.displayName = 'ScoreBadge'

// Status Badge - For connection/activity status
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'busy' | 'away' | 'active' | 'inactive'
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, children, ...props }, ref) => {
    const statusConfig = {
      online: { variant: 'success' as const, label: 'Online' },
      offline: { variant: 'default' as const, label: 'Offline' },
      busy: { variant: 'error' as const, label: 'Busy' },
      away: { variant: 'warning' as const, label: 'Away' },
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'default' as const, label: 'Inactive' },
    }

    const config = statusConfig[status]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot
        pulse={status === 'online' || status === 'active'}
        className={className}
        {...props}
      >
        {children || config.label}
      </Badge>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

export { Badge, badgeVariants, ScoreBadge, StatusBadge }
