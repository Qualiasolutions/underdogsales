'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, ArrowRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ICPData {
  product: string
  targetAudience: string
  industry?: string
  companySize?: string
  painPoints?: string[]
  existingCustomers?: string
  additionalContext?: string
}

interface GeneratedPersona {
  id: string
  name: string
  role: string
  company: string
  industry: string
  personality: string
  background: string
  painPoints: string[]
  objections: string[]
}

export function ICPBuilder() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [icpData, setIcpData] = useState<ICPData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPersona, setGeneratedPersona] = useState<GeneratedPersona | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hey! I'm here to help you build a custom roleplay persona. Let's start simple - what product or service do you sell?"
      }])
    }
  }, [messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/persona/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      if (data.isReady && data.icpData) {
        setIsReady(true)
        setIcpData(data.icpData)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, something went wrong. Let's try that again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const generatePersona = async () => {
    if (!icpData || isGenerating) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/persona/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icpData })
      })

      if (!response.ok) throw new Error('Failed to generate persona')

      const data = await response.json()
      setGeneratedPersona(data.persona)
    } catch (error) {
      console.error('Generation error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Had trouble generating your persona. Let's try again."
      }])
      setIsReady(false)
      setIcpData(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Success state - persona generated
  if (generatedPersona) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8 text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-semibold mb-2">Persona Created!</h1>
            <p className="text-muted-foreground">
              Meet your new practice partner
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-medium text-primary">
                  {generatedPersona.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-lg">{generatedPersona.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {generatedPersona.role} at {generatedPersona.company}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {generatedPersona.personality}
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Pain Points</p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedPersona.painPoints.slice(0, 3).map((point, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/practice"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              Start Practice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setGeneratedPersona(null)
                setIsReady(false)
                setIcpData(null)
                setMessages([{
                  role: 'assistant',
                  content: "Let's create another persona! What product or service do you sell?"
                }])
              }}
              className="px-4 py-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Create Persona</h1>
              <p className="text-xs text-muted-foreground">Tell me about your ICP</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Generate Button (when ready) */}
      <AnimatePresence>
        {isReady && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-border/50 bg-background/80 backdrop-blur-sm"
          >
            <div className="max-w-2xl mx-auto px-4 py-4">
              <button
                onClick={generatePersona}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-4 py-3.5 font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-5 h-5" />
                Generate My Persona
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating State */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-border/50 bg-background/80 backdrop-blur-sm"
          >
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="flex items-center justify-center gap-3 text-muted-foreground py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating your custom persona...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      {!isReady && !isGenerating && (
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2 border border-border/50 focus-within:border-primary/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
