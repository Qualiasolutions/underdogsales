'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import * as Sentry from '@sentry/nextjs'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  AlertCircle,
  Check,
  User,
  Wifi,
  WifiOff,
  Zap,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/ui/header'
import {
  startRetellSession,
  stopRetellSession,
  muteRetellSession,
  destroyRetellSession,
} from '@/lib/retell/client'
import { getAllPersonas, getPersonaById } from '@/config/personas'
import { savePracticeSession } from '@/lib/actions/practice-session'
import type { TranscriptEntry } from '@/types'

type ScenarioType = 'cold_call' | 'objection' | 'closing' | 'gatekeeper'
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface VoicePracticeProps {
  onSessionEnd?: (transcript: TranscriptEntry[]) => void
}

// Pre-calculated animation values for performance (avoids Math.random() in render)
const BAR_HEIGHTS = [85, 60, 95, 45, 75, 55, 90, 40, 80, 65, 70, 50, 88, 58, 92, 48]
const BAR_DURATIONS = [0.35, 0.42, 0.38, 0.45, 0.32, 0.48, 0.36, 0.44, 0.4, 0.33, 0.47, 0.39, 0.41, 0.34, 0.46, 0.37]

// Voice visualizer component with gold gradient (reduced from 32 to 16 bars for 50% CPU savings)
const VoiceVisualizer = memo(({ isActive }: { isActive: boolean }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-24">
      {BAR_HEIGHTS.map((maxHeight, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-gold to-gold-light"
          initial={{ height: '20%' }}
          animate={isActive ? {
            height: ['20%', `${maxHeight}%`, '20%'],
          } : { height: '20%' }}
          transition={{
            duration: BAR_DURATIONS[i],
            repeat: isActive ? Infinity : 0,
            delay: i * 0.03,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
})
VoiceVisualizer.displayName = 'VoiceVisualizer'

// Connection status indicator
const ConnectionIndicator = memo(({ status }: { status: ConnectionStatus }) => {
  const configs = {
    idle: { color: 'bg-muted-foreground', pulse: false, icon: WifiOff, label: 'Ready' },
    connecting: { color: 'bg-gold', pulse: true, icon: Wifi, label: 'Connecting...' },
    connected: { color: 'bg-success', pulse: true, icon: Zap, label: 'Connected' },
    error: { color: 'bg-error', pulse: false, icon: AlertCircle, label: 'Error' },
  }
  const config = configs[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
        {config.pulse && (
          <div className={cn('absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-75', config.color)} />
        )}
      </div>
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    </div>
  )
})
ConnectionIndicator.displayName = 'ConnectionIndicator'

// Premium transcript message component
const TranscriptMessage = memo(({
  entry,
  personaName,
  isLatest
}: {
  entry: TranscriptEntry
  personaName: string
  isLatest: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className={cn(
      'flex gap-3',
      entry.role === 'user' ? 'flex-row-reverse' : ''
    )}
  >
    <div className={cn(
      'w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm',
      entry.role === 'user'
        ? 'bg-gradient-to-br from-navy to-navy-light text-white'
        : 'bg-gradient-to-br from-gold/20 to-gold/10 text-gold-dark border border-gold/20'
    )}>
      {entry.role === 'user' ? 'You' : personaName.split(' ').map(n => n[0]).join('')}
    </div>
    <div className={cn(
      'flex-1 py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm',
      entry.role === 'user'
        ? 'bg-gradient-to-br from-navy to-navy-light text-white rounded-tr-md'
        : 'bg-card border border-border text-foreground rounded-tl-md',
      isLatest && 'ring-2 ring-gold/30'
    )}>
      {entry.content}
    </div>
  </motion.div>
))
TranscriptMessage.displayName = 'TranscriptMessage'

// Error message component with user-friendly explanations
const ErrorMessage = memo(({ error, onDismiss, onRetry }: {
  error: string
  onDismiss: () => void
  onRetry: () => void
}) => {
  // Provide user-friendly error messages
  const getErrorDetails = (err: string) => {
    if (err.includes('microphone') || err.includes('NotFoundError') || err.includes('mic')) {
      return {
        title: 'Microphone Not Found',
        message: 'We couldn\'t detect a microphone. Please connect one and try again.',
        tips: ['Check that your microphone is properly connected', 'Allow microphone access when prompted', 'Try using a different browser'],
      }
    }
    if (err.includes('permission') || err.includes('NotAllowedError')) {
      return {
        title: 'Microphone Access Denied',
        message: 'Please allow microphone access to start the call.',
        tips: ['Click the microphone icon in your browser\'s address bar', 'Select "Allow" when prompted', 'Refresh the page after granting permission'],
      }
    }
    if (err.includes('network') || err.includes('connection')) {
      return {
        title: 'Connection Failed',
        message: 'Unable to establish a connection. Please check your internet.',
        tips: ['Check your internet connection', 'Try refreshing the page', 'Disable any VPN or firewall'],
      }
    }
    return {
      title: 'Something Went Wrong',
      message: err || 'An unexpected error occurred.',
      tips: ['Try refreshing the page', 'Check your internet connection'],
    }
  }

  const details = getErrorDetails(error)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-2xl border border-error/20 bg-error-light/30 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">{details.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{details.message}</p>
            <ul className="space-y-1.5">
              {details.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex border-t border-error/10">
        <button
          onClick={onDismiss}
          className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors border-l border-error/10"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  )
})
ErrorMessage.displayName = 'ErrorMessage'

// Reusable loading state component (DRY refactor)
interface LoadingStateProps {
  title: string
  subtitle: string
  icon: LucideIcon
  iconVariant: 'navy' | 'gold'
  steps: string[]
  stepDelay?: number
}

const LoadingState = memo(({ title, subtitle, icon: Icon, iconVariant, steps, stepDelay = 0.5 }: LoadingStateProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[60vh]"
  >
    <Card variant="glass" className="p-12 text-center max-w-sm w-full">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-gold/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className={cn(
          "absolute inset-3 rounded-full flex items-center justify-center",
          iconVariant === 'navy'
            ? "bg-gradient-to-br from-navy to-navy-light shadow-navy"
            : "bg-gradient-to-br from-gold to-gold-light shadow-gold"
        )}>
          <Icon className={cn(
            "w-8 h-8",
            iconVariant === 'navy' ? 'text-white' : 'text-foreground animate-spin'
          )} />
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      <div className="space-y-2 text-left">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * stepDelay }}
            className="flex items-center gap-3 text-xs"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, delay: i * stepDelay, repeat: Infinity, repeatDelay: 1.5 }}
              className="w-2 h-2 rounded-full bg-gold"
            />
            <span className="text-muted-foreground">{step}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  </motion.div>
))
LoadingState.displayName = 'LoadingState'

export function VoicePractice({ onSessionEnd }: VoicePracticeProps) {
  const router = useRouter()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('skeptical_cfo')
  const selectedScenario: ScenarioType = 'cold_call' // Always use cold_call scenario
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [callId, setCallId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const transcriptDataRef = useRef<TranscriptEntry[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const callDurationRef = useRef(0)

  const personas = getAllPersonas()
  const selectedPersona = getPersonaById(selectedPersonaId)
  const isActive = connectionStatus === 'connected'

  // Sync transcript data to ref for use in callbacks
  useEffect(() => {
    transcriptDataRef.current = transcript
  }, [transcript])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [transcript])

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(d => {
          const newDuration = d + 1
          callDurationRef.current = newDuration
          return newDuration
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setCallDuration(0)
      callDurationRef.current = 0
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  // Cleanup: Stop voice session when navigating away
  useEffect(() => {
    return () => {
      // Destroy the session on unmount to stop audio
      destroyRetellSession()
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Save session and redirect to results
  const handleSessionComplete = useCallback(async (transcriptData: TranscriptEntry[], duration: number, vapiId?: string) => {
    // Skip if no meaningful transcript - show message to user
    if (transcriptData.length < 2) {
      setError('Call too short for analysis. Have a longer conversation to get feedback.')
      onSessionEnd?.(transcriptData)
      return
    }

    setIsSaving(true)
    try {
      const result = await savePracticeSession({
        personaId: selectedPersonaId,
        scenarioType: selectedScenario,
        transcript: transcriptData,
        durationSeconds: duration,
        vapiCallId: vapiId || undefined,
      })

      if (result.success && result.sessionId) {
        router.push(`/practice/results/${result.sessionId}`)
      } else {
        Sentry.captureMessage('Failed to save session', { level: 'error', extra: { error: result.error } })
        setError(result.error || 'Failed to save session')
        setIsSaving(false)
      }
    } catch (err) {
      Sentry.captureException(err, { tags: { operation: 'save_practice_session' } })
      setError('Failed to save your practice session')
      setIsSaving(false)
    }

    onSessionEnd?.(transcriptData)
  }, [selectedPersonaId, selectedScenario, router, onSessionEnd])

  const handleStart = useCallback(async () => {
    if (!selectedPersona) return

    setError(null)
    setTranscript([])

    // Check Retell configuration
    if (!selectedPersona.retellAgentId) {
      setError('Voice agent not configured for this persona.')
      setConnectionStatus('error')
      return
    }

    setConnectionStatus('connecting')

    const commonCallbacks = {
      onTranscript: (entry: TranscriptEntry) => {
        setTranscript((prev) => [...prev, entry])
      },
      onCallStart: (id: string) => {
        setCallId(id)
        setConnectionStatus('connected')
      },
      onCallEnd: (finalTranscript: TranscriptEntry[]) => {
        const currentCallId = callId
        const currentDuration = callDurationRef.current
        // Use the transcript from Retell client (deduplicated) if available,
        // otherwise fall back to our local state
        const transcriptToSave = finalTranscript.length > 0 ? finalTranscript : transcriptDataRef.current

        // Set saving state BEFORE changing connection status to prevent UI flash
        if (transcriptToSave.length >= 2) {
          setIsSaving(true)
        }

        setConnectionStatus('idle')
        setCallId(null)
        handleSessionComplete(transcriptToSave, currentDuration, currentCallId || undefined)
      },
      onError: (err: Error) => {
        setError(err.message || 'Connection failed')
        setConnectionStatus('error')
      },
    }

    try {
      const id = await startRetellSession({
        persona: selectedPersona,
        scenarioType: selectedScenario,
        ...commonCallbacks,
      })
      setCallId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setConnectionStatus('error')
    }
  }, [selectedPersona, selectedScenario, onSessionEnd, callId, handleSessionComplete])

  const handleStop = useCallback(() => {
    // stopRetellSession will trigger onCallEnd with the transcript
    // But we also handle it here in case the event doesn't fire
    const currentCallId = callId
    const currentDuration = callDurationRef.current
    const currentTranscript = transcriptDataRef.current

    stopRetellSession()

    // Set saving state BEFORE changing connection status to prevent UI flash
    if (currentTranscript.length >= 2) {
      setIsSaving(true)
    }

    setConnectionStatus('idle')
    setCallId(null)
    handleSessionComplete(currentTranscript, currentDuration, currentCallId || undefined)
  }, [callId, handleSessionComplete])

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    muteRetellSession(newMuted)
  }, [isMuted])

  const getDifficultyLabel = (warmth: number) => {
    if (warmth >= 0.6) return { label: 'Easy', color: 'text-success bg-success-light' }
    if (warmth >= 0.35) return { label: 'Medium', color: 'text-warning bg-warning-light' }
    return { label: 'Hard', color: 'text-error bg-error-light' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      {/* Shared Header with auth */}
      <Header variant="transparent" />

      {/* Connection status indicator */}
      <div className="fixed top-20 right-4 z-40">
        <ConnectionIndicator status={connectionStatus} />
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Setup View */}
            {!isActive && connectionStatus !== 'connecting' && !isSaving && (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Error State */}
                <AnimatePresence>
                  {error && (
                    <ErrorMessage
                      error={error}
                      onDismiss={() => { setError(null); setConnectionStatus('idle') }}
                      onRetry={handleStart}
                    />
                  )}
                </AnimatePresence>

                {/* Page Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
                    Choose Your <span className="text-gradient-gold">Challenge</span>
                  </h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Select a prospect persona and scenario to practice your cold calling skills
                  </p>
                </motion.div>

                {/* Prospect Selection */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Select Prospect
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {personas.length} personas available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personas.map((persona, index) => {
                      const difficulty = getDifficultyLabel(persona.warmth)
                      const isSelected = selectedPersonaId === persona.id

                      return (
                        <motion.div
                          key={persona.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            variant={isSelected ? 'bordered' : 'default'}
                            hover
                            className={cn(
                              'relative cursor-pointer transition-all duration-300',
                              isSelected && 'ring-2 ring-gold shadow-gold'
                            )}
                            onClick={() => setSelectedPersonaId(persona.id)}
                          >
                            {/* Selection indicator */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold"
                                >
                                  <Check className="w-3.5 h-3.5 text-foreground" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <CardContent className="p-5">
                              {/* Avatar */}
                              <div className="flex items-start gap-4 mb-4">
                                <div className={cn(
                                  'w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300',
                                  isSelected
                                    ? 'bg-gradient-to-br from-gold to-gold-light text-foreground shadow-gold'
                                    : 'bg-gradient-to-br from-navy/10 to-navy/5 text-foreground'
                                )}>
                                  {persona.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-foreground truncate">{persona.name}</h3>
                                  <p className="text-sm text-muted-foreground truncate">{persona.role}</p>
                                </div>
                              </div>

                              {/* Personality preview */}
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                {persona.personality}
                              </p>

                              {/* Difficulty badge */}
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                                difficulty.color
                              )}>
                                {difficulty.label}
                              </span>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </section>

                {/* Start Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="pt-4"
                >
                  <Button
                    variant="gold"
                    size="xl"
                    onClick={handleStart}
                    className="w-full group"
                    shine
                  >
                    <Phone className="w-5 h-5" />
                    <span>Start Practice Call</span>
                    <motion.span
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      →
                    </motion.span>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
                    <Mic className="w-3 h-3" />
                    Microphone access required
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Connecting View */}
            {connectionStatus === 'connecting' && (
              <LoadingState
                key="connecting"
                title="Connecting..."
                subtitle={`Preparing session with ${selectedPersona?.name}`}
                icon={Mic}
                iconVariant="navy"
                steps={['Initializing audio', 'Connecting to server', 'Starting session']}
                stepDelay={0.5}
              />
            )}

            {/* Saving View */}
            {isSaving && (
              <LoadingState
                key="saving"
                title="Analyzing Your Call"
                subtitle="Scoring your performance across 6 dimensions..."
                icon={Loader2}
                iconVariant="gold"
                steps={['Saving transcript', 'Running analysis', 'Generating feedback']}
                stepDelay={0.3}
              />
            )}

            {/* Active Call View */}
            {isActive && !isSaving && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-6"
              >
                {/* Call Panel */}
                <div className="lg:col-span-2">
                  <Card variant="navy" className="sticky top-24 overflow-hidden">
                    <CardContent className="p-8">
                      <div className="text-center">
                        {/* Persona Avatar */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative w-24 h-24 mx-auto mb-6"
                        >
                          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white text-2xl font-bold border border-white/10">
                            {selectedPersona?.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <motion.div
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-navy flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Zap className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        </motion.div>

                        <h2 className="text-white text-xl font-bold mb-1">
                          {selectedPersona?.name}
                        </h2>
                        <p className="text-white/60 text-sm mb-6">{selectedPersona?.role}</p>

                        {/* Timer */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 text-white/90 mb-8">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                          </span>
                          <span className="text-lg font-mono font-medium tracking-wider">
                            {formatDuration(callDuration)}
                          </span>
                        </div>

                        {/* Voice Visualizer */}
                        <div className="mb-10">
                          <VoiceVisualizer isActive={isActive && !isMuted} />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleMuteToggle}
                            className={cn(
                              'w-14 h-14 rounded-xl flex items-center justify-center transition-all',
                              isMuted
                                ? 'bg-error text-white shadow-lg shadow-error/30'
                                : 'bg-card/10 text-white/80 hover:bg-card/20 hover:text-white'
                            )}
                          >
                            {isMuted ? (
                              <MicOff className="w-6 h-6" />
                            ) : (
                              <Mic className="w-6 h-6" />
                            )}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStop}
                            className="w-16 h-16 rounded-2xl bg-error text-white flex items-center justify-center shadow-lg shadow-error/30 hover:bg-error/90 transition-colors"
                          >
                            <PhoneOff className="w-7 h-7" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-14 h-14 rounded-xl bg-card/10 text-white/80 hover:bg-card/20 hover:text-white flex items-center justify-center transition-all"
                          >
                            <Volume2 className="w-6 h-6" />
                          </motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transcript Panel */}
                <div className="lg:col-span-3">
                  <Card variant="elevated" className="h-full">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">Live Transcript</h3>
                        <p className="text-xs text-muted-foreground">
                          {transcript.length} {transcript.length === 1 ? 'message' : 'messages'}
                        </p>
                      </div>
                      {transcript.length > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-success"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          Recording
                        </span>
                      )}
                    </div>

                    <div
                      ref={transcriptRef}
                      className="max-h-[60vh] overflow-y-auto p-6 space-y-4 scroll-smooth"
                    >
                      {transcript.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Start speaking to begin the conversation
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            The transcript will appear here in real-time
                          </p>
                        </div>
                      ) : (
                        transcript.map((entry, i) => (
                          <TranscriptMessage
                            key={i}
                            entry={entry}
                            personaName={selectedPersona?.name || 'Assistant'}
                            isLatest={i === transcript.length - 1}
                          />
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session ID (debug) */}
          {callId && process.env.NODE_ENV === 'development' && (
            <p className="text-[10px] text-muted-foreground/40 text-center mt-8 font-mono">
              Session: {callId}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
