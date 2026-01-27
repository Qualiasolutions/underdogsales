'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  AlertCircle,
  Wifi,
  WifiOff,
  Zap,
  Hammer,
  Shield,
  MessageCircle,
  Search,
  User,
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
} from '@/lib/retell/client'
import { GIULIO_COACH, COACHING_MODES, type CoachingMode } from '@/config/coach'
import type { TranscriptEntry } from '@/types'

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

// Voice visualizer component with gold gradient
const VoiceVisualizer = memo(({ isActive }: { isActive: boolean }) => {
  const bars = 32

  return (
    <div className="flex items-end justify-center gap-[3px] h-24">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-gold to-gold-light"
          initial={{ height: '20%' }}
          animate={isActive ? {
            height: ['20%', `${25 + Math.random() * 75}%`, '20%'],
          } : { height: '20%' }}
          transition={{
            duration: 0.3 + Math.random() * 0.2,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.015,
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

// Transcript message component
const TranscriptMessage = memo(({
  entry,
  isLatest
}: {
  entry: TranscriptEntry
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
      {entry.role === 'user' ? 'You' : 'GS'}
    </div>
    <div className={cn(
      'flex-1 py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm',
      entry.role === 'user'
        ? 'bg-gradient-to-br from-navy to-navy-light text-white rounded-tr-md'
        : 'bg-white border border-border text-navy rounded-tl-md',
      isLatest && 'ring-2 ring-gold/30'
    )}>
      {entry.content}
    </div>
  </motion.div>
))
TranscriptMessage.displayName = 'TranscriptMessage'

// Error message component
const ErrorMessage = memo(({ error, onDismiss, onRetry }: {
  error: string
  onDismiss: () => void
  onRetry: () => void
}) => {
  const getErrorDetails = (err: string) => {
    if (err.includes('microphone') || err.includes('NotFoundError') || err.includes('mic')) {
      return {
        title: 'Microphone Not Found',
        message: 'We couldn\'t detect a microphone. Please connect one and try again.',
        tips: ['Check that your microphone is properly connected', 'Allow microphone access when prompted'],
      }
    }
    if (err.includes('permission') || err.includes('NotAllowedError')) {
      return {
        title: 'Microphone Access Denied',
        message: 'Please allow microphone access to start the coaching session.',
        tips: ['Click the microphone icon in your browser\'s address bar', 'Refresh the page after granting permission'],
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
            <h3 className="font-bold text-navy mb-1">{details.title}</h3>
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
          className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:text-navy hover:bg-white/50 transition-colors"
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

const modeIcons: Record<CoachingMode, LucideIcon> = {
  pitch: Hammer,
  objections: Shield,
  research: Search,
  general: MessageCircle,
}

export function VoiceCoach() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [selectedMode, setSelectedMode] = useState<CoachingMode>('general')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [callId, setCallId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const transcriptDataRef = useRef<TranscriptEntry[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isActive = connectionStatus === 'connected'

  // Sync transcript data to ref
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
        setCallDuration(d => d + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setCallDuration(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = useCallback(async () => {
    setError(null)
    setTranscript([])

    if (!GIULIO_COACH.retellAgentId) {
      setError('Voice agent not configured. Please contact support.')
      setConnectionStatus('error')
      return
    }

    setConnectionStatus('connecting')

    try {
      const id = await startRetellSession({
        persona: {
          id: GIULIO_COACH.id,
          name: GIULIO_COACH.name,
          role: GIULIO_COACH.role,
          retellAgentId: GIULIO_COACH.retellAgentId,
          personality: '',
          objections: [],
          warmth: 0.8,
          voiceId: '',
          assistantId: '',
        },
        scenarioType: 'cold_call',
        onTranscript: (entry: TranscriptEntry) => {
          setTranscript((prev) => [...prev, entry])
        },
        onCallStart: (callId: string) => {
          setCallId(callId)
          setConnectionStatus('connected')
        },
        onCallEnd: () => {
          setConnectionStatus('idle')
          setCallId(null)
        },
        onError: (err: Error) => {
          setError(err.message || 'Connection failed')
          setConnectionStatus('error')
        },
      })
      setCallId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setConnectionStatus('error')
    }
  }, [selectedMode])

  const handleStop = useCallback(() => {
    stopRetellSession()
    setConnectionStatus('idle')
    setCallId(null)
  }, [])

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    muteRetellSession(newMuted)
  }, [isMuted])

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      {/* Shared Header with auth */}
      <Header variant="transparent" />

      {/* Connection status indicator */}
      <div className="fixed top-20 right-4 sm:right-8 z-40">
        <ConnectionIndicator status={connectionStatus} />
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Setup View */}
            {!isActive && connectionStatus !== 'connecting' && (
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
                  <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight mb-3">
                    Coach <span className="text-gradient-gold">Giulio</span>
                  </h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {GIULIO_COACH.title} - {GIULIO_COACH.description}
                  </p>
                </motion.div>

                {/* Coach Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="max-w-md mx-auto"
                >
                  <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-navy text-2xl font-bold shadow-gold">
                        GS
                      </div>
                      <div>
                        <h2 className="font-bold text-navy text-xl">{GIULIO_COACH.name}</h2>
                        <p className="text-sm text-muted-foreground">{GIULIO_COACH.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      &ldquo;You might wonder why I sound weird - that&apos;s just my accent. I&apos;m here to help you master cold calling with the Underdog methodology.&rdquo;
                    </p>
                  </Card>
                </motion.div>

                {/* Mode Selection */}
                <section>
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">
                    What would you like to work on?
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {COACHING_MODES.map((mode, index) => {
                      const Icon = modeIcons[mode.id]
                      return (
                        <motion.button
                          key={mode.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          onClick={() => setSelectedMode(mode.id)}
                          className={cn(
                            'p-4 rounded-xl text-left transition-all duration-200 border-2',
                            selectedMode === mode.id
                              ? 'border-gold bg-gold/5 shadow-md'
                              : 'border-transparent bg-white hover:border-border hover:shadow-sm'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors',
                            selectedMode === mode.id
                              ? 'bg-gradient-to-br from-gold to-gold-light text-navy'
                              : 'bg-navy/5 text-navy/70'
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-sm font-bold text-navy mb-0.5">
                            {mode.label}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {mode.description}
                          </p>
                        </motion.button>
                      )
                    })}
                  </div>
                </section>

                {/* Start Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="pt-4 max-w-md mx-auto"
                >
                  <Button
                    variant="gold"
                    size="xl"
                    onClick={handleStart}
                    className="w-full group"
                    shine
                  >
                    <Phone className="w-5 h-5" />
                    <span>Start Coaching Session</span>
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
              <motion.div
                key="connecting"
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
                    <div className="absolute inset-3 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-gold text-navy font-bold text-lg">
                      GS
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-navy mb-2">
                    Connecting to Giulio...
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Preparing your coaching session
                  </p>

                  <div className="space-y-2 text-left">
                    {['Initializing audio', 'Connecting to coach', 'Starting session'].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="flex items-center gap-3 text-xs"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, delay: i * 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                          className="w-2 h-2 rounded-full bg-gold"
                        />
                        <span className="text-muted-foreground">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Active Call View */}
            {isActive && (
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
                        {/* Coach Avatar */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative w-24 h-24 mx-auto mb-6"
                        >
                          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-navy text-2xl font-bold border border-white/10 shadow-gold">
                            GS
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
                          {GIULIO_COACH.name}
                        </h2>
                        <p className="text-white/60 text-sm mb-6">{GIULIO_COACH.title}</p>

                        {/* Timer */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 mb-8">
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
                                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
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
                            className="w-14 h-14 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white flex items-center justify-center transition-all"
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
                        <h3 className="font-bold text-navy">Live Transcript</h3>
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
                            Giulio will start speaking...
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
