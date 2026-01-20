'use client'

import { motion } from 'motion/react'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TranscriptEntry } from '@/types'

interface TranscriptViewProps {
  transcript: TranscriptEntry[]
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transcript available
      </div>
    )
  }

  const formatTimestamp = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {transcript.map((entry, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className={cn(
            'flex gap-3',
            entry.role === 'user' ? 'flex-row-reverse' : ''
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              'w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center',
              entry.role === 'user'
                ? 'bg-gradient-to-br from-navy to-navy-light'
                : 'bg-muted'
            )}
          >
            {entry.role === 'user' ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'py-3 px-4 rounded-2xl text-sm leading-relaxed',
                entry.role === 'user'
                  ? 'bg-gradient-to-br from-navy to-navy-light text-white rounded-tr-md'
                  : 'bg-white border border-border text-navy rounded-tl-md'
              )}
            >
              {entry.content}
            </div>
            <span
              className={cn(
                'text-xs text-muted-foreground mt-1 block',
                entry.role === 'user' ? 'text-right' : 'text-left'
              )}
            >
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
