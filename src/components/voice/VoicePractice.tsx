'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  ChevronDown,
  User,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  startRoleplaySession,
  stopRoleplaySession,
  muteRoleplaySession,
} from '@/lib/vapi/client'
import { getAllPersonas, getPersonaById } from '@/config/personas'
import type { TranscriptEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FadeIn,
  VoiceVisualizer,
  PulseRing,
  ScrollReveal,
} from '@/components/ui/motion'

type ScenarioType = 'cold_call' | 'objection' | 'closing' | 'gatekeeper'

interface VoicePracticeProps {
  onSessionEnd?: (transcript: TranscriptEntry[]) => void
}

const scenarioInfo: Record<ScenarioType, { label: string; description: string }> = {
  cold_call: {
    label: 'Cold Call',
    description: 'Practice the full cold call flow from opener to close',
  },
  objection: {
    label: 'Objection Handling',
    description: 'Focus on handling common objections with confidence',
  },
  closing: {
    label: 'Closing',
    description: 'Master the art of securing the next step',
  },
  gatekeeper: {
    label: 'Gatekeeper',
    description: 'Navigate past gatekeepers to reach decision makers',
  },
}

export function VoicePractice({ onSessionEnd }: VoicePracticeProps) {
  const [isActive, setIsActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('skeptical_cfo')
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('cold_call')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [callId, setCallId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false)

  const personas = getAllPersonas()
  const selectedPersona = getPersonaById(selectedPersonaId)

  const handleStart = useCallback(async () => {
    if (!selectedPersona) return

    setError(null)
    setTranscript([])

    try {
      const id = await startRoleplaySession({
        persona: selectedPersona,
        scenarioType: selectedScenario,
        onTranscript: (entry) => {
          setTranscript((prev) => [...prev, entry])
        },
        onCallStart: (id) => {
          setCallId(id)
          setIsActive(true)
        },
        onCallEnd: () => {
          setIsActive(false)
          setCallId(null)
          onSessionEnd?.(transcript)
        },
        onError: (err) => {
          setError(err.message)
          setIsActive(false)
        },
      })
      setCallId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
    }
  }, [selectedPersona, selectedScenario, transcript, onSessionEnd])

  const handleStop = useCallback(() => {
    stopRoleplaySession()
    setIsActive(false)
    setCallId(null)
    onSessionEnd?.(transcript)
  }, [transcript, onSessionEnd])

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    muteRoleplaySession(newMuted)
  }, [isMuted])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>

            <h1 className="text-lg font-bold text-navy font-[family-name:var(--font-maven-pro)]">
              Voice Practice
            </h1>

            <Button variant="ghost" size="icon-sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Setup Section */}
          <AnimatePresence mode="wait">
            {!isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Persona Selection */}
                <FadeIn>
                  <Card variant="bordered" className="p-0 overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                            <User className="w-6 h-6 text-gold-dark" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Practice with</p>
                            <p className="font-bold text-navy">
                              {selectedPersona?.name} - {selectedPersona?.role}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-muted-foreground transition-transform',
                            showPersonaDropdown && 'rotate-180'
                          )}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {showPersonaDropdown && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-border"
                        >
                          <div className="p-2">
                            {personas.map((persona) => (
                              <motion.button
                                key={persona.id}
                                whileHover={{ backgroundColor: 'rgb(248 249 252)' }}
                                onClick={() => {
                                  setSelectedPersonaId(persona.id)
                                  setShowPersonaDropdown(false)
                                }}
                                className={cn(
                                  'w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors',
                                  selectedPersonaId === persona.id && 'bg-gold/10'
                                )}
                              >
                                <div
                                  className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center',
                                    selectedPersonaId === persona.id
                                      ? 'bg-gold text-navy'
                                      : 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-navy">
                                    {persona.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {persona.role} - Warmth: {Math.round(persona.warmth * 100)}%
                                  </p>
                                </div>
                                {selectedPersonaId === persona.id && (
                                  <Badge variant="gold" size="sm">
                                    Selected
                                  </Badge>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </FadeIn>

                {/* Persona Description */}
                {selectedPersona && (
                  <FadeIn delay={0.1}>
                    <Card variant="glass" className="p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedPersona.personality}
                      </p>
                    </Card>
                  </FadeIn>
                )}

                {/* Scenario Selection */}
                <FadeIn delay={0.2}>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-navy">Select Scenario</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.entries(scenarioInfo) as [ScenarioType, typeof scenarioInfo[ScenarioType]][]).map(
                        ([key, info]) => (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedScenario(key)}
                            className={cn(
                              'p-4 rounded-xl border-2 text-left transition-all',
                              selectedScenario === key
                                ? 'border-gold bg-gold/5'
                                : 'border-border hover:border-gold/50'
                            )}
                          >
                            <p className="font-semibold text-navy mb-1">{info.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {info.description}
                            </p>
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                </FadeIn>

                {/* Start Button */}
                <FadeIn delay={0.3}>
                  <Button
                    variant="gold"
                    size="xl"
                    className="w-full"
                    onClick={handleStart}
                  >
                    <Phone className="w-5 h-5" />
                    Start Practice Call
                  </Button>
                </FadeIn>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Call Section */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Active Call Card */}
                <Card variant="navy" className="p-8">
                  <div className="text-center space-y-6">
                    {/* Persona */}
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-gold/20 flex items-center justify-center mb-4">
                        <User className="w-10 h-10 text-gold" />
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedPersona?.name}
                      </p>
                      <p className="text-white/60">{selectedPersona?.role}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="success" dot pulse>
                        Call in Progress
                      </Badge>
                    </div>

                    {/* Voice Visualizer */}
                    <div className="py-8">
                      <VoiceVisualizer active barCount={9} className="h-24 justify-center" />
                    </div>

                    {/* Call Controls */}
                    <div className="flex items-center justify-center gap-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMuteToggle}
                        className={cn(
                          'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                          isMuted
                            ? 'bg-error text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        )}
                      >
                        {isMuted ? (
                          <MicOff className="w-6 h-6" />
                        ) : (
                          <Mic className="w-6 h-6" />
                        )}
                      </motion.button>

                      <PulseRing active color="error">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStop}
                          className="w-20 h-20 rounded-full bg-error flex items-center justify-center"
                        >
                          <PhoneOff className="w-8 h-8 text-white" />
                        </motion.button>
                      </PulseRing>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                      >
                        <Volume2 className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </div>
                </Card>

                {/* Transcript */}
                {transcript.length > 0 && (
                  <ScrollReveal>
                    <Card variant="bordered" className="p-0">
                      <div className="p-4 border-b border-border">
                        <p className="font-semibold text-navy">Live Transcript</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                        {transcript.map((entry, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              'p-3 rounded-xl',
                              entry.role === 'user'
                                ? 'bg-gold/10 ml-8'
                                : 'bg-muted mr-8'
                            )}
                          >
                            <span className="text-xs font-semibold text-muted-foreground block mb-1">
                              {entry.role === 'user' ? 'You' : selectedPersona?.name}
                            </span>
                            <p className="text-sm text-navy">{entry.content}</p>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </ScrollReveal>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card variant="bordered" className="p-4 border-error/50 bg-error-light">
                  <p className="text-sm text-error">{error}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Debug Info */}
          {callId && (
            <p className="text-xs text-muted-foreground text-center">
              Call ID: {callId}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
