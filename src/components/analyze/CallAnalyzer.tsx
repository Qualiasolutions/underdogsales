'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { FileAudio, ArrowLeft, RefreshCw } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadZone } from './UploadZone'
import { UploadProgress } from './UploadProgress'
import { AnalysisHistory } from './AnalysisHistory'
import { getUserCallUploads } from '@/lib/actions/call-analysis'
import type { CallUpload, CallUploadStatus } from '@/types'

type UploadState = 'idle' | 'uploading' | 'processing' | 'error'

export function CallAnalyzer() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [processingStatus, setProcessingStatus] = useState<CallUploadStatus | 'uploading'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<CallUpload[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)

  // Load analysis history
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const result = await getUserCallUploads()
      setAnalyses(result.uploads)
    } catch (err) {
      Sentry.captureException(err, { tags: { operation: 'load_analysis_history' } })
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // SSE for real-time status updates with improved error handling
  useEffect(() => {
    if (!currentCallId || uploadState !== 'processing') return

    let retryCount = 0
    const maxRetries = 3
    const sseTimeout = 45000 // 45s before fallback
    let timeoutId: NodeJS.Timeout | null = null
    let isClosed = false

    const eventSource = new EventSource(`/api/analyze/${currentCallId}/stream`)

    // Set SSE timeout - fall back to polling if no message received
    timeoutId = setTimeout(() => {
      if (!isClosed) {
        eventSource.close()
        fallbackToPoll()
      }
    }, sseTimeout)

    eventSource.onmessage = (event) => {
      // Clear timeout on any message received
      if (timeoutId) clearTimeout(timeoutId)

      try {
        const data = JSON.parse(event.data)
        setProcessingStatus(data.status)

        if (data.status === 'completed') {
          isClosed = true
          eventSource.close()
          router.push(`/analyze/${currentCallId}`)
        } else if (data.status === 'failed' || data.status === 'error') {
          isClosed = true
          eventSource.close()
          setUploadState('error')
          setError(data.error || 'Processing failed')
        }
      } catch (err) {
        Sentry.captureException(err, { tags: { operation: 'sse_parse' } })
      }
    }

    eventSource.onerror = () => {
      if (timeoutId) clearTimeout(timeoutId)
      eventSource.close()
      fallbackToPoll()
    }

    // Fallback polling with exponential backoff
    async function fallbackToPoll() {
      if (isClosed) return

      if (retryCount >= maxRetries) {
        setUploadState('error')
        setError('Processing timed out. Please try again.')
        return
      }

      retryCount++
      const delay = Math.pow(2, retryCount) * 1000 // 2s, 4s, 8s

      await new Promise(resolve => setTimeout(resolve, delay))
      if (isClosed) return

      try {
        const response = await fetch(`/api/analyze/${currentCallId}`)
        if (!response.ok) throw new Error('Status check failed')

        const data = await response.json()
        setProcessingStatus(data.status)

        if (data.status === 'completed') {
          isClosed = true
          router.push(`/analyze/${currentCallId}`)
        } else if (data.status === 'failed') {
          isClosed = true
          setUploadState('error')
          setError(data.error_message || 'Processing failed')
        } else {
          // Still processing, continue polling
          fallbackToPoll()
        }
      } catch (err) {
        Sentry.captureException(err, { tags: { operation: 'fallback_poll' } })
        fallbackToPoll() // Retry on error
      }
    }

    return () => {
      isClosed = true
      if (timeoutId) clearTimeout(timeoutId)
      eventSource.close()
    }
  }, [currentCallId, uploadState, router])

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setError(null)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) return

    setUploadState('uploading')
    setProcessingStatus('uploading')
    setError(null)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload file
      const uploadRes = await fetch('/api/analyze/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const data = await uploadRes.json()
        throw new Error(data.error || 'Upload failed')
      }

      const uploadData = await uploadRes.json()
      const callId = uploadData.callId
      setCurrentCallId(callId)

      // Start processing
      setUploadState('processing')
      setProcessingStatus('transcribing')

      // Trigger transcription
      const transcribeRes = await fetch('/api/analyze/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      })

      if (!transcribeRes.ok) {
        const data = await transcribeRes.json()
        throw new Error(data.error || 'Transcription failed')
      }

      setProcessingStatus('scoring')

      // Trigger scoring
      const scoreRes = await fetch('/api/analyze/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      })

      if (!scoreRes.ok) {
        const data = await scoreRes.json()
        throw new Error(data.error || 'Scoring failed')
      }

      // Redirect to results
      setProcessingStatus('completed')
      router.push(`/analyze/${callId}`)
    } catch (err) {
      Sentry.captureException(err, { tags: { operation: 'call_upload' } })
      setUploadState('error')
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [file, router])

  const handleReset = useCallback(() => {
    setUploadState('idle')
    setFile(null)
    setProcessingStatus('pending')
    setError(null)
    setCurrentCallId(null)
  }, [])

  const handleSelectAnalysis = useCallback((callId: string) => {
    router.push(`/analyze/${callId}`)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <Header variant="transparent" />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Upload View */}
            {(uploadState === 'idle' || uploadState === 'error') && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
                    Call <span className="text-gradient-gold">Analysis</span>
                  </h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Upload your sales call recordings to get detailed AI-powered analysis and coaching feedback
                  </p>
                </motion.div>

                {/* Upload Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card variant="elevated" className="p-6">
                    <UploadZone
                      file={file}
                      onFileSelect={handleFileSelect}
                      onRemove={handleRemoveFile}
                      isUploading={false}
                      progress={0}
                    />

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <p className="text-sm text-red-600">{error}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          className="mt-2 text-red-600 hover:text-red-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </motion.div>
                    )}

                    {/* Analyze button */}
                    {file && !error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                      >
                        <Button
                          variant="gold"
                          size="lg"
                          onClick={handleUpload}
                          className="w-full"
                          shine
                        >
                          <FileAudio className="w-5 h-5" />
                          Analyze Call
                        </Button>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>

                {/* Analysis History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Recent Analyses
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadHistory}
                      disabled={isLoadingHistory}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <AnalysisHistory
                    analyses={analyses}
                    onSelect={handleSelectAnalysis}
                    isLoading={isLoadingHistory}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Processing View */}
            {(uploadState === 'uploading' || uploadState === 'processing') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <Card variant="elevated" className="w-full max-w-lg p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Analyzing Your Call
                    </h2>
                    <p className="text-muted-foreground">
                      {file?.name}
                    </p>
                  </div>

                  <UploadProgress
                    status={processingStatus}
                    error={error}
                  />

                  <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground">
                      This may take a few minutes depending on the call length
                    </p>
                  </div>
                </Card>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="mt-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel and go back
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  )
}
