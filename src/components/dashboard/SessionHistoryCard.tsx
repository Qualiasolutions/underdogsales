'use client'

import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPersonaById } from '@/config/personas'

interface SessionHistoryCardProps {
  session: {
    id: string
    persona_id: string
    scenario_type: string
    duration_seconds: number
    created_at: string
    overall_score: number
  }
  index: number
  onClick: () => void
}

export function SessionHistoryCard({ session, index, onClick }: SessionHistoryCardProps) {
  const persona = getPersonaById(session.persona_id)
  const personaName = persona?.name || 'Unknown'

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatScenarioType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 cursor-pointer transition-all duration-200"
    >
      {/* Score indicator */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold',
        session.overall_score >= 7 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
        session.overall_score >= 5 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
        'bg-muted text-muted-foreground'
      )}>
        {session.overall_score > 0 ? session.overall_score.toFixed(1) : '—'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{personaName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatScenarioType(session.scenario_type)} · {formatDuration(session.duration_seconds)}
        </p>
      </div>

      {/* Date & Arrow */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{formatDate(session.created_at)}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
    </motion.div>
  )
}
