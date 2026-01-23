'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Mic, FileAudio, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getUserPracticeSessions } from '@/lib/actions/practice-session'
import { getUserCallUploads } from '@/lib/actions/call-analysis'
import { SessionHistoryCard } from './SessionHistoryCard'
import { CallHistoryCard } from './CallHistoryCard'
import { Header } from '@/components/ui/header'
import type { CallUpload } from '@/types'

interface PracticeSession {
  id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number
  created_at: string
  overall_score: number
}

interface DashboardClientProps {
  initialSessions: PracticeSession[]
  initialSessionsHasMore: boolean
  initialCalls: CallUpload[]
  initialCallsHasMore: boolean
}

export function DashboardClient({
  initialSessions,
  initialSessionsHasMore,
  initialCalls,
  initialCallsHasMore,
}: DashboardClientProps) {
  const router = useRouter()

  // State for practice sessions
  const [sessions, setSessions] = useState(initialSessions)
  const [sessionsHasMore, setSessionsHasMore] = useState(initialSessionsHasMore)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsOffset, setSessionsOffset] = useState(0)

  // State for call uploads
  const [calls, setCalls] = useState(initialCalls)
  const [callsHasMore, setCallsHasMore] = useState(initialCallsHasMore)
  const [callsLoading, setCallsLoading] = useState(false)
  const [callsOffset, setCallsOffset] = useState(0)

  // Tab state
  const [activeTab, setActiveTab] = useState<'practice' | 'calls'>('practice')

  // Navigation handlers
  const handleSessionClick = (sessionId: string) => {
    router.push(`/practice/results/${sessionId}`)
  }

  const handleCallClick = (callId: string) => {
    router.push(`/analyze/${callId}`)
  }

  // Load more handlers
  const loadMoreSessions = async () => {
    setSessionsLoading(true)
    const newOffset = sessionsOffset + 10
    const result = await getUserPracticeSessions({ limit: 10, offset: newOffset })
    setSessions((prev) => [...prev, ...result.sessions])
    setSessionsHasMore(result.hasMore)
    setSessionsOffset(newOffset)
    setSessionsLoading(false)
  }

  const loadMoreCalls = async () => {
    setCallsLoading(true)
    const newOffset = callsOffset + 10
    const result = await getUserCallUploads({ limit: 10, offset: newOffset })
    setCalls((prev) => [...prev, ...result.uploads])
    setCallsHasMore(result.hasMore)
    setCallsOffset(newOffset)
    setCallsLoading(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-navy">Your Activity</h1>
            <p className="text-muted-foreground mt-1">
              Track your practice sessions and call analyses
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8"
          >
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('practice')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'practice'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-muted-foreground hover:text-navy'
                )}
              >
                <Mic className="w-4 h-4 inline mr-2" />
                Practice Sessions
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'calls'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-muted-foreground hover:text-navy'
                )}
              >
                <FileAudio className="w-4 h-4 inline mr-2" />
                Call Analyses
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6"
          >
            {activeTab === 'practice' && (
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No practice sessions yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start your first practice to build your history
                    </p>
                    <Link href="/practice" className="mt-4 inline-block">
                      <Button variant="primary" size="sm">
                        <Mic className="w-4 h-4 mr-2" />
                        Start Practicing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {sessions.map((session, index) => (
                      <SessionHistoryCard
                        key={session.id}
                        session={session}
                        index={index}
                        onClick={() => handleSessionClick(session.id)}
                      />
                    ))}
                    {sessionsHasMore && (
                      <Button
                        variant="outline"
                        onClick={loadMoreSessions}
                        disabled={sessionsLoading}
                        className="w-full mt-4"
                      >
                        {sessionsLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'calls' && (
              <div className="space-y-3">
                {calls.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <FileAudio className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No call analyses yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your first call recording to get started
                    </p>
                    <Link href="/analyze" className="mt-4 inline-block">
                      <Button variant="primary" size="sm">
                        <FileAudio className="w-4 h-4 mr-2" />
                        Upload a Call
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {calls.map((call, index) => (
                      <CallHistoryCard
                        key={call.id}
                        call={call}
                        index={index}
                        onClick={() => handleCallClick(call.id)}
                      />
                    ))}
                    {callsHasMore && (
                      <Button
                        variant="outline"
                        onClick={loadMoreCalls}
                        disabled={callsLoading}
                        className="w-full mt-4"
                      >
                        {callsLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  )
}
