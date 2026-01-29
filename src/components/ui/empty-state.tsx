'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from './button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    variant?: ButtonProps['variant']
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
  illustration?: 'default' | 'search' | 'upload' | 'chart' | 'conversation'
}

// SVG Illustrations
function DefaultIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <circle cx="100" cy="100" r="60" className="fill-muted/50" />
      <rect x="75" y="80" width="50" height="40" rx="8" className="fill-gold/30" />
      <rect x="80" y="90" width="40" height="4" rx="2" className="fill-gold" />
      <rect x="80" y="100" width="30" height="4" rx="2" className="fill-gold/60" />
      <rect x="80" y="110" width="35" height="4" rx="2" className="fill-gold/40" />
    </svg>
  )
}

function SearchIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <circle cx="90" cy="90" r="35" className="stroke-gold" strokeWidth="6" fill="none" />
      <line x1="115" y1="115" x2="145" y2="145" className="stroke-gold" strokeWidth="6" strokeLinecap="round" />
      <circle cx="90" cy="90" r="20" className="fill-gold/20" />
    </svg>
  )
}

function UploadIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <rect x="60" y="70" width="80" height="80" rx="12" className="fill-gold/20 stroke-gold/40" strokeWidth="2" strokeDasharray="8 4" />
      <path d="M100 90 L100 130" className="stroke-gold" strokeWidth="4" strokeLinecap="round" />
      <path d="M85 105 L100 90 L115 105" className="stroke-gold" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function ChartIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <rect x="55" y="120" width="20" height="30" rx="4" className="fill-gold/40" />
      <rect x="85" y="90" width="20" height="60" rx="4" className="fill-gold/60" />
      <rect x="115" y="70" width="20" height="80" rx="4" className="fill-gold" />
      <line x1="45" y1="155" x2="155" y2="155" className="stroke-gold/40" strokeWidth="2" />
    </svg>
  )
}

function ConversationIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <rect x="50" y="70" width="70" height="40" rx="8" className="fill-gold/30" />
      <rect x="55" y="80" width="50" height="4" rx="2" className="fill-gold" />
      <rect x="55" y="90" width="35" height="4" rx="2" className="fill-gold/60" />
      <polygon points="55,110 65,110 55,120" className="fill-gold/30" />
      <rect x="80" y="100" width="70" height="40" rx="8" className="fill-muted-foreground/20" />
      <rect x="85" y="110" width="50" height="4" rx="2" className="fill-muted-foreground/40" />
      <rect x="85" y="120" width="35" height="4" rx="2" className="fill-muted-foreground/30" />
      <polygon points="145,140 135,140 145,150" className="fill-muted-foreground/20" />
    </svg>
  )
}

const illustrations = {
  default: DefaultIllustration,
  search: SearchIllustration,
  upload: UploadIllustration,
  chart: ChartIllustration,
  conversation: ConversationIllustration,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration = 'default',
}: EmptyStateProps) {
  const IllustrationComponent = illustrations[illustration]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
    >
      {/* Icon or Illustration */}
      {icon ? (
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <div className="text-muted-foreground">{icon}</div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="w-32 h-32 mb-4"
        >
          <IllustrationComponent className="w-full h-full" />
        </motion.div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            action.href ? (
              <a href={action.href}>
                <Button variant={action.variant || 'primary'} size="sm" onClick={action.onClick}>
                  {action.label}
                </Button>
              </a>
            ) : (
              <Button variant={action.variant || 'primary'} size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <a href={secondaryAction.href}>
                <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              </a>
            ) : (
              <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </motion.div>
  )
}
