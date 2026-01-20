'use client'

import { motion } from 'motion/react'
import { FileAudio, Clock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CallUpload } from '@/types'
import { getScoreColor } from '@/config/rubric'

interface AnalysisHistoryProps {
  analyses: CallUpload[]
  onSelect: (callId: string) => void
  isLoading?: boolean
}

export function AnalysisHistory({
  analyses,
  onSelect,
  isLoading = false,
}: AnalysisHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileAudio className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No call analyses yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your first call recording to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis, index) => (
        <AnalysisHistoryCard
          key={analysis.id}
          analysis={analysis}
          onClick={() => onSelect(analysis.id)}
          index={index}
        />
      ))}
    </div>
  )
}

interface AnalysisHistoryCardProps {
  analysis: CallUpload
  onClick: () => void
  index: number
}

function AnalysisHistoryCard({
  analysis,
  onClick,
  index,
}: AnalysisHistoryCardProps) {
  const isCompleted = analysis.status === 'completed'
  const isFailed = analysis.status === 'failed'
  const isProcessing =
    analysis.status === 'pending' ||
    analysis.status === 'transcribing' ||
    analysis.status === 'scoring'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = () => {
    if (isCompleted && analysis.overall_score) {
      const scoreColor = getScoreColor(analysis.overall_score)
      return (
        <span className={cn('font-bold text-lg', scoreColor)}>
          {analysis.overall_score.toFixed(1)}
        </span>
      )
    }
    if (isFailed) {
      return (
        <span className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          Failed
        </span>
      )
    }
    if (isProcessing) {
      return (
        <span className="flex items-center gap-1 text-sm text-gold">
          <Loader2 className="w-4 h-4 animate-spin" />
          {analysis.status === 'transcribing' && 'Transcribing'}
          {analysis.status === 'scoring' && 'Scoring'}
          {analysis.status === 'pending' && 'Pending'}
        </span>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-white rounded-xl border border-border p-4 cursor-pointer transition-all',
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
          <p className="font-medium text-navy truncate">
            {analysis.original_filename || 'Untitled Recording'}
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {analysis.duration_seconds
                ? formatDuration(analysis.duration_seconds)
                : '--:--'}
            </span>
            <span>{formatDate(analysis.created_at)}</span>
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
