'use client'

import { motion } from 'motion/react'
import { ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CallUpload } from '@/types'

interface CallHistoryCardProps {
  call: CallUpload
  index: number
  onClick: () => void
}

export function CallHistoryCard({ call, index, onClick }: CallHistoryCardProps) {
  const isCompleted = call.status === 'completed'
  const isFailed = call.status === 'failed'
  const isProcessing = call.status === 'pending' || call.status === 'transcribing' || call.status === 'scoring'

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

  const truncateFilename = (name: string, maxLen = 30) => {
    if (name.length <= maxLen) return name
    const ext = name.split('.').pop() || ''
    const baseName = name.slice(0, name.length - ext.length - 1)
    return baseName.slice(0, maxLen - ext.length - 4) + '...' + (ext ? '.' + ext : '')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 cursor-pointer transition-all duration-200',
        isProcessing && 'opacity-70'
      )}
    >
      {/* Score/Status indicator */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold',
        isCompleted && call.overall_score && call.overall_score >= 7 && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        isCompleted && call.overall_score && call.overall_score >= 5 && call.overall_score < 7 && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        isCompleted && call.overall_score && call.overall_score < 5 && 'bg-red-500/10 text-red-600 dark:text-red-400',
        isFailed && 'bg-red-500/10 text-red-500',
        isProcessing && 'bg-muted'
      )}>
        {isCompleted && call.overall_score ? (
          call.overall_score.toFixed(1)
        ) : isFailed ? (
          <AlertCircle className="w-4 h-4" />
        ) : isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : '—'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">
          {truncateFilename(call.original_filename || 'Untitled')}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {call.duration_seconds ? formatDuration(call.duration_seconds) : '—'}
          {isProcessing && (
            <span className="ml-2 text-gold">
              {call.status === 'transcribing' && 'Transcribing...'}
              {call.status === 'scoring' && 'Analyzing...'}
              {call.status === 'pending' && 'Queued'}
            </span>
          )}
        </p>
      </div>

      {/* Date & Arrow */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{formatDate(call.created_at)}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
    </motion.div>
  )
}
