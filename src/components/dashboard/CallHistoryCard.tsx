'use client'

import { motion } from 'motion/react'
import { FileAudio, Clock, ChevronRight, AlertCircle, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/config/rubric'
import { Badge } from '@/components/ui/badge'
import type { CallUpload } from '@/types'

interface CallHistoryCardProps {
  call: CallUpload
  index: number
  onClick: () => void
}

export function CallHistoryCard({ call, index, onClick }: CallHistoryCardProps) {
  const isCompleted = call.status === 'completed'
  const isFailed = call.status === 'failed'
  const isProcessing =
    call.status === 'pending' ||
    call.status === 'transcribing' ||
    call.status === 'scoring'

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = () => {
    if (isCompleted && call.overall_score) {
      return (
        <span className={cn('font-bold text-lg', getScoreColor(call.overall_score))}>
          {call.overall_score.toFixed(1)}
        </span>
      )
    }
    if (isFailed) {
      return (
        <Badge variant="error" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      )
    }
    if (isProcessing) {
      return (
        <Badge variant="gold" className="text-xs">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          {call.status === 'transcribing' && 'Transcribing'}
          {call.status === 'scoring' && 'Scoring'}
          {call.status === 'pending' && 'Pending'}
        </Badge>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-card rounded-xl border border-border p-4 cursor-pointer transition-all',
        'hover:shadow-md hover:border-navy/20',
        isProcessing && 'animate-pulse'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            isCompleted && 'bg-emerald-100',
            isFailed && 'bg-red-100',
            isProcessing && 'bg-gold/10'
          )}
        >
          <FileAudio
            className={cn(
              'w-6 h-6',
              isCompleted && 'text-emerald-600',
              isFailed && 'text-red-500',
              isProcessing && 'text-gold'
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {call.original_filename || 'Untitled Recording'}
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {call.duration_seconds ? formatDuration(call.duration_seconds) : '--:--'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(call.created_at)}
            </span>
          </div>
        </div>

        {/* Status/Score */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  )
}
