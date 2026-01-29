'use client'

import { motion } from 'motion/react'
import { Mic, Clock, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPersonaById } from '@/config/personas'
import { getScoreColor } from '@/config/rubric'
import { Badge } from '@/components/ui/badge'

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

export function SessionHistoryCard({
  session,
  index,
  onClick,
}: SessionHistoryCardProps) {
  const persona = getPersonaById(session.persona_id)
  const personaName = persona?.name || 'Unknown Persona'

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatScenarioType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-card rounded-xl border border-border p-4 cursor-pointer transition-all',
        'hover:shadow-md hover:border-navy/20'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Mic className="w-6 h-6 text-emerald-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{personaName}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
            <Badge variant="default" className="text-xs">
              {formatScenarioType(session.scenario_type)}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(session.duration_seconds)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(session.created_at)}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          {session.overall_score > 0 && (
            <span className={cn('font-bold text-lg', getScoreColor(session.overall_score))}>
              {session.overall_score.toFixed(1)}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  )
}
