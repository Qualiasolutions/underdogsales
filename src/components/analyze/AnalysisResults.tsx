'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import {
  ArrowLeft,
  FileAudio,
  Clock,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreBreakdown } from './ScoreBreakdown'
import { TranscriptView } from './TranscriptView'
import { getCallUpload } from '@/lib/actions/call-analysis'
import type { CallUpload } from '@/types'
import { cn } from '@/lib/utils'

interface AnalysisResultsProps {
  callId: string
}

type Tab = 'analysis' | 'transcript'

export function AnalysisResults({ callId }: AnalysisResultsProps) {
  const [callData, setCallData] = useState<CallUpload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('analysis')

  useEffect(() => {
    const loadCallData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCallUpload(callId)
        if (!data) {
          setError('Analysis not found')
          return
        }
        setCallData(data)
      } catch (err) {
        Sentry.captureException(err, { tags: { operation: 'load_call_data' } })
        setError('Failed to load analysis')
      } finally {
        setIsLoading(false)
      }
    }

    loadCallData()
  }, [callId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
        <Header variant="transparent" />
        <main className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error || !callData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
        <Header variant="transparent" />
        <main className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {error || 'Analysis not found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The requested analysis could not be loaded.
            </p>
            <Link href="/analyze">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Call Analysis
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Still processing
  if (callData.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
        <Header variant="transparent" />
        <main className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            {callData.status === 'failed' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Analysis Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {callData.error_message || 'An error occurred during processing'}
                </p>
              </>
            ) : (
              <>
                <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Processing Your Call
                </h2>
                <p className="text-muted-foreground mb-6">
                  {callData.status === 'transcribing' && 'Transcribing audio...'}
                  {callData.status === 'scoring' && 'Analyzing sales techniques...'}
                  {callData.status === 'pending' && 'Starting analysis...'}
                </p>
              </>
            )}
            <Link href="/analyze">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Call Analysis
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <Header variant="transparent" />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href="/analyze"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Call Analysis
            </Link>
          </motion.div>

          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card variant="elevated" className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center flex-shrink-0">
                  <FileAudio className="w-7 h-7 text-gold" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {callData.original_filename || 'Call Recording'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {callData.duration_seconds
                        ? formatDuration(callData.duration_seconds)
                        : '--:--'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(callData.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('analysis')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'analysis'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  activeTab === 'transcript'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Transcript
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'analysis' && callData.analysis && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ScoreBreakdown
                  analysis={callData.analysis}
                  overallScore={callData.overall_score ?? 0}
                />
              </motion.div>
            )}

            {activeTab === 'transcript' && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card variant="elevated" className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    Call Transcript
                  </h2>
                  <TranscriptView transcript={callData.transcript} />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
