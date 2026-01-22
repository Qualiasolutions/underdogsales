'use client'

import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass' | 'gradient' | 'navy' | 'premium'
  hover?: boolean
  glow?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-border',
      elevated: 'bg-white shadow-lg',
      bordered: 'bg-white border-2 border-navy/10',
      glass: 'glass',
      gradient: 'bg-gradient-to-br from-white to-muted border border-border',
      navy: 'bg-navy text-white',
      premium: 'bg-white border border-border/50 shadow-sm card-glow gradient-border',
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl p-6',
          variants[variant],
          hover && 'cursor-pointer',
          glow && 'glow-gold',
          className
        )}
        whileHover={hover ? {
          y: -4,
          boxShadow: '0 20px 40px -12px rgb(2 25 69 / 0.15)',
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold tracking-tight text-navy', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center mt-4 pt-4 border-t border-border', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

// Feature Card - Premium hover effect with icon
interface FeatureCardProps extends CardProps {
  icon?: ReactNode
  title: string
  description: string
  badge?: string
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, badge, className, ...props }, ref) => (
    <Card
      ref={ref}
      hover
      variant="bordered"
      className={cn('group relative overflow-hidden', className)}
      {...props}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative">
        {badge && (
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-gold/10 text-gold-dark rounded-full mb-4">
            {badge}
          </span>
        )}

        {icon && (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <div className="text-gold-dark">{icon}</div>
          </div>
        )}

        <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-navy-light transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <svg
          className="w-4 h-4 text-navy"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  )
)
FeatureCard.displayName = 'FeatureCard'

// Stat Card - For displaying metrics
interface StatCardProps extends CardProps {
  value: React.ReactNode
  label: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ value, label, trend, trendValue, className, ...props }, ref) => (
    <Card ref={ref} variant="elevated" className={cn('text-center', className)} {...props}>
      <p className="text-4xl font-bold text-navy mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {trend && trendValue && (
        <div className={cn(
          'inline-flex items-center gap-1 mt-3 text-xs font-medium px-2 py-1 rounded-full',
          trend === 'up' && 'bg-success-light text-success',
          trend === 'down' && 'bg-error-light text-error',
          trend === 'neutral' && 'bg-muted text-muted-foreground'
        )}>
          {trend === 'up' && '+'}{trendValue}
        </div>
      )}
    </Card>
  )
)
StatCard.displayName = 'StatCard'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FeatureCard,
  StatCard,
}
