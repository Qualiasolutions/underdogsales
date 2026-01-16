'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  ArrowLeft,
  AlertCircle,
  Check,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  startRoleplaySession,
  stopRoleplaySession,
  muteRoleplaySession,
} from '@/lib/vapi/client'
import { getAllPersonas, getPersonaById } from '@/config/personas'
import type { TranscriptEntry } from '@/types'

type ScenarioType = 'cold_call' | 'objection' | 'closing' | 'gatekeeper'
type ConnectionStatus = 'idle' | 'checking_mic' | 'connecting' | 'connected' | 'error'

interface VoicePracticeProps {
  onSessionEnd?: (transcript: TranscriptEntry[]) => void
}

const scenarios: { id: ScenarioType; label: string; description: string }[] = [
  { id: 'cold_call', label: 'Cold Call', description: 'Full conversation flow' },
  { id: 'objection', label: 'Objection Handling', description: 'Overcome resistance' },
  { id: 'closing', label: 'Closing', description: 'Secure the next step' },
  { id: 'gatekeeper', label: 'Gatekeeper', description: 'Navigate past barriers' },
]

// Memoized transcript message component for performance
const TranscriptMessage = memo(({
  entry,
  personaInitial
}: {
  entry: TranscriptEntry
  personaInitial: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      'flex gap-3',
      entry.role === 'user' ? 'flex-row-reverse' : ''
    )}
  >
    <div className={cn(
      'w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-semibold',
      entry.role === 'user'
        ? 'bg-neutral-900 text-white'
        : 'bg-neutral-100 text-neutral-600'
    )}>
      {entry.role === 'user' ? 'Y' : personaInitial}
    </div>
    <div className={cn(
      'flex-1 py-3 px-4 text-sm',
      entry.role === 'user'
        ? 'bg-neutral-900 text-white'
        : 'bg-neutral-50 text-neutral-700'
    )}>
      {entry.content}
    </div>
  </motion.div>
))
TranscriptMessage.displayName = 'TranscriptMessage'

export function VoicePractice({ onSessionEnd }: VoicePracticeProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('skeptical_cfo')
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('cold_call')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [callId, setCallId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const transcriptDataRef = useRef<TranscriptEntry[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
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

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch {
      return false
    }
  }

  const handleStart = useCallback(async () => {
    if (!selectedPersona) return

    setError(null)
    setTranscript([])

    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      setError('Voice service not configured')
      setConnectionStatus('error')
      return
    }

    setConnectionStatus('checking_mic')
    const hasMic = await checkMicrophonePermission()

    if (!hasMic) {
      setError('Microphone access required')
      setConnectionStatus('error')
      return
    }

    setConnectionStatus('connecting')

    try {
      const id = await startRoleplaySession({
        persona: selectedPersona,
        scenarioType: selectedScenario,
        onTranscript: (entry) => {
          setTranscript((prev) => [...prev, entry])
        },
        onCallStart: (id) => {
          setCallId(id)
          setConnectionStatus('connected')
        },
        onCallEnd: () => {
          setConnectionStatus('idle')
          setCallId(null)
          // Use ref to get current transcript without causing re-renders
          onSessionEnd?.(transcriptDataRef.current)
        },
        onError: (err) => {
          setError(err.message || 'Connection failed')
          setConnectionStatus('error')
        },
      })
      setCallId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setConnectionStatus('error')
    }
  }, [selectedPersona, selectedScenario, onSessionEnd])

  const handleStop = useCallback(() => {
    stopRoleplaySession()
    setConnectionStatus('idle')
    setCallId(null)
    // Use ref to get current transcript without causing re-renders
    onSessionEnd?.(transcriptDataRef.current)
  }, [onSessionEnd])

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    muteRoleplaySession(newMuted)
  }, [isMuted])

  const getDifficultyLabel = (warmth: number) => {
    if (warmth >= 0.6) return 'Easy'
    if (warmth >= 0.35) return 'Medium'
    return 'Hard'
  }

  const getDifficultyColor = (warmth: number) => {
    if (warmth >= 0.6) return 'text-emerald-600'
    if (warmth >= 0.35) return 'text-amber-600'
    return 'text-rose-600'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-wide">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <Image
              src="/underdog-logo.png"
              alt="Underdog Sales"
              width={28}
              height={28}
              className="opacity-90"
            />
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">
              Voice Practice
            </span>
          </div>

          <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Setup View */}
            {!isActive && connectionStatus !== 'checking_mic' && connectionStatus !== 'connecting' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-rose-50 border border-rose-100 flex items-center gap-3"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                    <span className="text-sm text-rose-900">{error}</span>
                    <button
                      onClick={() => { setError(null); setConnectionStatus('idle') }}
                      className="ml-auto text-sm text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}

                {/* Page Title */}
                <div className="mb-12">
                  <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-3">
                    Select Your Practice Session
                  </h1>
                  <p className="text-neutral-500 text-base">
                    Choose a prospect persona and scenario to begin training
                  </p>
                </div>

                {/* Prospect Selection */}
                <section className="mb-12">
                  <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-6">
                    Prospect
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {personas.map((persona, index) => (
                      <motion.button
                        key={persona.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedPersonaId(persona.id)}
                        className={cn(
                          'relative p-5 text-left transition-all duration-200 border',
                          selectedPersonaId === persona.id
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        )}
                      >
                        {selectedPersonaId === persona.id && (
                          <motion.div
                            layoutId="persona-check"
                            className="absolute top-4 right-4 w-5 h-5 bg-neutral-900 flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={2} />
                          </motion.div>
                        )}

                        <div className="mb-3">
                          <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center text-neutral-600 text-sm font-semibold">
                            {persona.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold text-neutral-900 mb-0.5">
                          {persona.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mb-3">{persona.role}</p>

                        <span className={cn('text-xs font-medium', getDifficultyColor(persona.warmth))}>
                          {getDifficultyLabel(persona.warmth)}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Persona Detail */}
                <AnimatePresence mode="wait">
                  {selectedPersona && (
                    <motion.section
                      key={selectedPersona.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mb-12 overflow-hidden"
                    >
                      <div className="p-6 bg-neutral-50 border border-neutral-100">
                        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                          About {selectedPersona.name}
                        </h3>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                          {selectedPersona.personality}
                        </p>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Scenario Selection */}
                <section className="mb-16">
                  <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-6">
                    Scenario
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {scenarios.map((scenario, index) => (
                      <motion.button
                        key={scenario.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.03 }}
                        onClick={() => setSelectedScenario(scenario.id)}
                        className={cn(
                          'p-4 text-left transition-all duration-200 border',
                          selectedScenario === scenario.id
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        )}
                      >
                        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                          {scenario.label}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          {scenario.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Start Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <button
                    onClick={handleStart}
                    className="group w-full py-5 bg-neutral-900 text-white text-sm font-semibold tracking-wide transition-all duration-200 hover:bg-neutral-800 flex items-center justify-center gap-3"
                  >
                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                    <span>Start Practice Call</span>
                    <motion.span
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    >
                      →
                    </motion.span>
                  </button>
                  <p className="text-center text-xs text-neutral-400 mt-4">
                    Ensure your microphone is connected
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Connecting View */}
            {(connectionStatus === 'checking_mic' || connectionStatus === 'connecting') && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <div className="text-center">
                  {/* Minimal Loader */}
                  <div className="relative w-16 h-16 mx-auto mb-8">
                    <motion.div
                      className="absolute inset-0 border border-neutral-200"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-2 bg-neutral-900 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                    {connectionStatus === 'checking_mic' ? 'Checking Microphone' : 'Connecting'}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {connectionStatus === 'checking_mic'
                      ? 'Allow microphone access if prompted'
                      : `Preparing session with ${selectedPersona?.name}`}
                  </p>

                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center gap-1 mt-8">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-8 h-0.5 bg-neutral-200"
                        animate={{
                          backgroundColor: i <= (connectionStatus === 'connecting' ? 1 : 0)
                            ? '#171717'
                            : '#e5e5e5'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Call View */}
            {isActive && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
              >
                {/* Call Panel */}
                <div className="lg:col-span-2">
                  <div className="bg-neutral-900 p-8 sticky top-24">
                    <div className="text-center">
                      {/* Persona */}
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative w-20 h-20 mx-auto mb-6"
                      >
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white text-lg font-semibold">
                          {selectedPersona?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-neutral-900" />
                      </motion.div>

                      <h2 className="text-white text-lg font-semibold mb-1">
                        {selectedPersona?.name}
                      </h2>
                      <p className="text-neutral-400 text-sm mb-6">{selectedPersona?.role}</p>

                      {/* Timer */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-neutral-300 mb-8">
                        <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-mono tracking-wider">
                          {formatDuration(callDuration)}
                        </span>
                      </div>

                      {/* Audio Visualizer */}
                      <div className="flex items-end justify-center gap-0.5 h-16 mb-10">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-gradient-to-t from-amber-500/80 to-amber-400"
                            animate={{
                              height: ['15%', `${20 + Math.random() * 80}%`, '15%'],
                            }}
                            transition={{
                              duration: 0.4 + Math.random() * 0.3,
                              repeat: Infinity,
                              delay: i * 0.02,
                            }}
                          />
                        ))}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleMuteToggle}
                          className={cn(
                            'w-12 h-12 flex items-center justify-center transition-colors',
                            isMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                          )}
                        >
                          {isMuted ? (
                            <MicOff className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <Mic className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStop}
                          className="w-14 h-14 bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                        >
                          <PhoneOff className="w-6 h-6" strokeWidth={1.5} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-12 h-12 bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transcript Panel */}
                <div className="lg:col-span-3">
                  <div className="border border-neutral-200">
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-neutral-900">Transcript</h3>
                      <span className="text-xs text-neutral-400">
                        {transcript.length} {transcript.length === 1 ? 'message' : 'messages'}
                      </span>
                    </div>

                    <div
                      ref={transcriptRef}
                      className="max-h-[60vh] overflow-y-auto p-5 space-y-4"
                    >
                      {transcript.length === 0 ? (
                        <div className="text-center py-16">
                          <p className="text-sm text-neutral-400">
                            Conversation will appear here...
                          </p>
                        </div>
                      ) : (
                        transcript.map((entry, i) => (
                          <TranscriptMessage
                            key={i}
                            entry={entry}
                            personaInitial={selectedPersona?.name[0] || 'A'}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session ID */}
          {callId && (
            <p className="text-xs text-neutral-300 text-center mt-12 font-mono">
              {callId}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
