'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Send,
  Loader2,
  Hammer,
  Shield,
  MessageCircle,
  Search,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Markdown } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/ui/header'
import { GIULIO_COACH, COACHING_MODES, type CoachingMode } from '@/config/coach'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const modeIcons: Record<CoachingMode, LucideIcon> = {
  pitch: Hammer,
  objections: Shield,
  research: Search,
  general: MessageCircle,
}

function CoachAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  const sizePx = { sm: 36, md: 64, lg: 80 }

  return (
    <Image
      src="/coach.png"
      alt={GIULIO_COACH.name}
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(
        sizeClasses[size],
        'rounded-xl border border-gold/20 bg-gradient-to-br from-gold/30 to-gold/10 object-contain flex-shrink-0'
      )}
    />
  )
}

export function ChatCoach() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState<CoachingMode>('general')
  const [hasStarted, setHasStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getModeGreeting = (mode: CoachingMode): string => {
    const greetings: Record<CoachingMode, string> = {
      pitch: `Hey! This is Giulio. You want to build your pitch - smart move. A great pitch is about problems, not features. We're gonna craft something that makes prospects actually want to listen. Tell me - what do you sell, and what's the biggest problem it solves for your customers?`,
      objections: `Hey! This is Giulio. Alright, you want to practice objection handling - this is where the money is made. I've got 17 objections we're going to master together. Here's how we'll do this: I'll throw an objection at you like I'm a prospect, you respond, and I'll coach you on what worked and what didn't. Remember the 4-step framework: Pause, Acknowledge, Ask Permission, Ask a Question. Ready? Let's start with the classic... "I'm not interested." Go ahead, how do you respond?`,
      research: `Hey! This is Giulio. Smart - you're doing research before your call. That's what separates the pros from the amateurs. Tell me the company name or website and I'll dig up everything we need to know - what they do, their pain points, recent news. Then I'll help you craft a personalized opener that'll actually get their attention. Who are we researching?`,
      general: `Hey! This is Giulio. I'm here to help you master cold calling. Ask me anything - whether it's about handling a specific objection, improving your opener, understanding the psychology behind a technique, or just venting about a tough call. What's on your mind?`,
    }
    return greetings[mode]
  }

  const handleStart = useCallback(() => {
    setHasStarted(true)
    setMessages([{
      role: 'assistant',
      content: getModeGreeting(selectedMode),
      timestamp: Date.now(),
    }])
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [selectedMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          mode: selectedMode,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 flex flex-col">
      <Header variant="transparent" />

      <main className="flex-1 pt-24 pb-4 px-4 sm:px-6 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-center items-center space-y-8"
              >
                {/* Page Title */}
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
                    Chat with <span className="text-gradient-gold">Giulio</span>
                  </h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Text-based coaching with the Underdog methodology
                  </p>
                </div>

                {/* Coach Card */}
                <Card variant="elevated" className="p-6 max-w-md w-full">
                  <div className="flex items-center gap-4 mb-6">
                    <CoachAvatar size="md" />
                    <div>
                      <h2 className="font-bold text-foreground text-lg">{GIULIO_COACH.name}</h2>
                      <p className="text-sm text-muted-foreground">{GIULIO_COACH.title}</p>
                    </div>
                  </div>
                </Card>

                {/* Mode Selection */}
                <div className="w-full max-w-2xl">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">
                    Select topic
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {COACHING_MODES.map((mode) => {
                      const Icon = modeIcons[mode.id]
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedMode(mode.id)}
                          className={cn(
                            'p-4 rounded-xl text-left transition-all duration-200 border-2',
                            selectedMode === mode.id
                              ? 'border-gold bg-gold/5 shadow-md'
                              : 'border-transparent bg-card hover:border-border hover:shadow-sm'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors',
                            selectedMode === mode.id
                              ? 'bg-gradient-to-br from-gold to-gold-light text-foreground'
                              : 'bg-navy/5 text-foreground/70'
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-sm font-bold text-foreground mb-0.5">
                            {mode.label}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {mode.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  variant="gold"
                  size="xl"
                  onClick={handleStart}
                  className="group"
                  shine
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start Chat</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                  {messages.map((message, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      )}
                    >
                      {message.role === 'user' ? (
                        <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm bg-gradient-to-br from-navy to-navy-light text-white">
                          You
                        </div>
                      ) : (
                        <CoachAvatar size="sm" />
                      )}
                      <div className={cn(
                        'max-w-[80%] py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-navy to-navy-light text-white rounded-tr-md'
                          : 'bg-card border border-border text-foreground rounded-tl-md'
                      )}>
                        <Markdown content={message.content} />
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <CoachAvatar size="sm" />
                      <div className="py-3 px-4 rounded-2xl rounded-tl-md bg-card border border-border">
                        <Loader2 className="w-5 h-5 animate-spin text-gold" />
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border pt-4">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none text-sm"
                        rows={1}
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="gold"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="h-12 w-12 rounded-xl flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
