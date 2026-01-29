'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  Sparkles,
  Send,
  Loader2,
  Check,
  RefreshCw,
  Building2,
  Users,
  Target,
  Lightbulb,
  ArrowRight,
  Briefcase,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ICPContext } from '@/app/api/icp/generate/route'

interface ICPConfirmationProps {
  onConfirm: (context: ICPContext) => void
  onSkip: () => void
}

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
  icpData?: ICPContext
}

// Structured ICP display component
function ICPDisplay({ ctx }: { ctx: ICPContext }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Based on your profile, here's what I understand:</p>

      {/* Company Section */}
      <div className="rounded-xl bg-muted/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gold" />
          <span className="font-semibold text-foreground">You work for {ctx.company}</span>
        </div>
        <p className="text-sm text-muted-foreground pl-6">{ctx.companyDescription}</p>
      </div>

      {/* Target Role Section */}
      <div className="rounded-xl bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gold" />
          <span className="font-semibold text-foreground">You're selling to {ctx.targetRole}s</span>
        </div>
        <p className="text-sm text-muted-foreground pl-6">They typically face:</p>
        <ul className="space-y-2 pl-6">
          {ctx.painPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Value Props Section */}
      <div className="rounded-xl bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gold" />
          <span className="font-semibold text-foreground">Key value props to emphasize</span>
        </div>
        <ul className="space-y-2 pl-6">
          {ctx.valueProps.map((prop, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{prop}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-muted-foreground pt-2">
        Does this look right? Type any corrections or confirm to start practicing.
      </p>
    </div>
  )
}

export function ICPConfirmation({ onConfirm, onSkip }: ICPConfirmationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [icpContext, setIcpContext] = useState<ICPContext | null>(null)
  const [profile, setProfile] = useState<{ company: string; targetRole: string } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)

  // Fetch profile and generate ICP on mount
  useEffect(() => {
    async function loadICP() {
      setIsLoading(true)

      try {
        // First get user profile
        const profileRes = await fetch('/api/user/profile')
        if (!profileRes.ok) throw new Error('Failed to fetch profile')

        const profileData = await profileRes.json()

        if (!profileData.company || !profileData.targetRole) {
          setNeedsSetup(true)
          setIsLoading(false)
          return
        }

        setProfile({
          company: profileData.company,
          targetRole: profileData.targetRole,
        })

        // Check if we have cached ICP context
        if (profileData.icpContext) {
          setIcpContext(profileData.icpContext)
          setMessages([
            {
              role: 'assistant',
              content: '',
              icpData: profileData.icpContext,
            },
          ])
          setIsLoading(false)
          return
        }

        // Generate new ICP context
        const icpRes = await fetch('/api/icp/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: profileData.company,
            targetRole: profileData.targetRole,
          }),
        })

        if (!icpRes.ok) throw new Error('Failed to generate ICP')

        const icpData = await icpRes.json()
        setIcpContext(icpData.icpContext)
        setMessages([
          {
            role: 'assistant',
            content: '',
            icpData: icpData.icpContext,
          },
        ])
      } catch (error) {
        console.error('Failed to load ICP:', error)
        setMessages([
          {
            role: 'assistant',
            content: "I couldn't load your profile. You can skip this step and practice with a generic scenario.",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadICP()
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isRefining || !profile) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsRefining(true)

    try {
      // Use chat API to refine the ICP based on user feedback
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `I'm a salesperson at ${profile.company} selling to ${profile.targetRole}s.

Here's my current ICP context:
${JSON.stringify(icpContext, null, 2)}

The user said: "${userMessage}"

Please update the ICP context based on their feedback. Respond with a friendly acknowledgment and the updated information. Keep it conversational.`,
            },
          ],
          mode: 'general',
        }),
      })

      if (!response.ok) throw new Error('Failed to refine ICP')

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Failed to refine ICP:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Got it! I've noted your feedback. Ready to start practicing?" },
      ])
    } finally {
      setIsRefining(false)
    }
  }, [input, isRefining, profile, icpContext])

  const handleConfirm = () => {
    if (icpContext) {
      onConfirm(icpContext)
    }
  }

  const handleRefresh = async () => {
    if (!profile) return

    setIsLoading(true)
    try {
      const icpRes = await fetch('/api/icp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: profile.company,
          targetRole: profile.targetRole,
          forceRefresh: true,
        }),
      })

      if (!icpRes.ok) throw new Error('Failed to regenerate ICP')

      const icpData = await icpRes.json()
      setIcpContext(icpData.icpContext)
      setMessages([
        {
          role: 'assistant',
          content: '',
          icpData: icpData.icpContext,
        },
      ])
    } catch (error) {
      console.error('Failed to refresh ICP:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Needs profile setup
  if (needsSetup) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 mx-auto mb-6 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Quick Setup Needed</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Tell us your company and who you sell to so we can personalize your practice.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-primary-foreground font-medium hover:bg-gold/90 transition-colors"
          >
            Set Up Profile
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={onSkip}
            className="block w-full mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 mx-auto mb-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
          <h2 className="text-lg font-medium mb-2">Preparing your session...</h2>
          <p className="text-muted-foreground text-sm">
            Researching your target buyers to customize the practice
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm mb-3">
          <Target className="w-4 h-4" />
          ICP Check
        </div>
        <h2 className="text-xl font-semibold">Let's confirm your target buyer</h2>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {/* Messages */}
        <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-gold/10 text-gold'
                )}
              >
                {msg.role === 'user' ? 'You' : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  'flex-1 py-3 px-4 rounded-2xl text-sm',
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-muted/50'
                )}
              >
                {msg.icpData ? (
                  <ICPDisplay ctx={msg.icpData} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isRefining && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-gold animate-spin" />
              </div>
              <div className="flex-1 py-3 px-4 rounded-2xl bg-muted/50 text-sm text-muted-foreground">
                Thinking...
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type corrections or press confirm..."
              className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              disabled={isRefining}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isRefining}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                input.trim() && !isRefining
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border p-4 flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Regenerate
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            disabled={!icpContext}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gold text-primary-foreground text-sm font-medium hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Looks Good, Start Practice
          </button>
        </div>
      </div>

      {/* Quick Info Cards */}
      {icpContext && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Building2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Company</p>
            <p className="text-sm font-medium truncate">{icpContext.company}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-medium truncate">{icpContext.targetRole}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Lightbulb className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Pain Points</p>
            <p className="text-sm font-medium">{icpContext.painPoints.length}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
