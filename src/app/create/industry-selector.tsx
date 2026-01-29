'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { cn } from '@/lib/utils'
import { RetellWebClient } from 'retell-client-js-sdk'

const ONBOARDING_AGENT_ID = 'agent_359e51125f7858d53c64fe9e31'

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'complete' | 'error'

export function IndustrySelector() {
  const router = useRouter()
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<RetellWebClient | null>(null)
  const [transcript, setTranscript] = useState<string>('')

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.stopCall()
      }
    }
  }, [client])

  const startCall = useCallback(async () => {
    setError(null)
    setStatus('connecting')
    setTranscript('')

    try {
      // Register call with our backend
      const response = await fetch('/api/retell/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: ONBOARDING_AGENT_ID,
          metadata: { scenarioType: 'onboarding' },
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to start call')
      }

      const { accessToken } = await response.json()

      // Create and configure Retell client
      const retellClient = new RetellWebClient()
      setClient(retellClient)

      retellClient.on('call_started', () => {
        setStatus('connected')
      })

      retellClient.on('call_ended', () => {
        setStatus('complete')
        // Redirect to practice after a short delay
        setTimeout(() => {
          router.push('/practice')
        }, 2000)
      })

      retellClient.on('update', (update) => {
        if (update.transcript && update.transcript.length > 0) {
          const lastEntry = update.transcript[update.transcript.length - 1]
          if (lastEntry.content) {
            setTranscript(lastEntry.content)
          }
        }
      })

      retellClient.on('error', (err) => {
        console.error('Retell error:', err)
        setError('Connection error. Please try again.')
        setStatus('error')
      })

      // Start the call
      await retellClient.startCall({
        accessToken,
        sampleRate: 24000,
        captureDeviceId: 'default',
      })
    } catch (err) {
      console.error('Start call error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start call')
      setStatus('error')
    }
  }, [router])

  const stopCall = useCallback(() => {
    if (client) {
      client.stopCall()
    }
    setStatus('idle')
  }, [client])

  const toggleMute = useCallback(() => {
    if (client) {
      if (isMuted) {
        client.unmute()
      } else {
        client.mute()
      }
      setIsMuted(!isMuted)
    }
  }, [client, isMuted])

  const isActive = status === 'connected'

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Quick Setup
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Tell us about your industry
            </h1>
            <p className="text-muted-foreground text-sm">
              A quick voice chat to customize your training
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-8"
          >
            {/* Idle State */}
            {status === 'idle' && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gold/10 mx-auto mb-6 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-gold" />
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  We'll ask you one quick question about what you sell
                </p>
                <button
                  onClick={startCall}
                  className="w-full py-4 rounded-2xl bg-gold text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Start Voice Setup
                </button>
              </div>
            )}

            {/* Connecting State */}
            {status === 'connecting' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
                <p className="text-muted-foreground text-sm">Connecting...</p>
              </div>
            )}

            {/* Active Call State */}
            {isActive && (
              <div className="text-center">
                {/* Voice Visualizer */}
                <div className="w-24 h-24 rounded-full bg-gold/10 mx-auto mb-6 flex items-center justify-center relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gold/20"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Volume2 className="w-10 h-10 text-gold relative z-10" />
                </div>

                {/* Transcript */}
                {transcript && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground mb-6 min-h-[40px]"
                  >
                    "{transcript}"
                  </motion.p>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={toggleMute}
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                      isMuted
                        ? 'bg-error text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={stopCall}
                    className="w-16 h-16 rounded-2xl bg-error text-white flex items-center justify-center hover:bg-error/90 transition-colors"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                </div>
              </div>
            )}

            {/* Complete State */}
            {status === 'complete' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-6 flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-success" />
                </motion.div>
                <p className="font-medium mb-2">All set!</p>
                <p className="text-muted-foreground text-sm">Redirecting to practice...</p>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-error/10 mx-auto mb-6 flex items-center justify-center">
                  <PhoneOff className="w-8 h-8 text-error" />
                </div>
                <p className="text-error text-sm mb-4">{error}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>

          {/* Skip option */}
          {(status === 'idle' || status === 'error') && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              <button
                onClick={() => router.push('/practice')}
                className="hover:text-foreground underline"
              >
                Skip for now
              </button>
            </motion.p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
