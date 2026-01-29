'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { Mic, FileAudio, Loader2, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getUserPracticeSessions } from '@/lib/actions/practice-session'
import { getUserCallUploads } from '@/lib/actions/call-analysis'
import { SessionHistoryCard } from './SessionHistoryCard'
import { CallHistoryCard } from './CallHistoryCard'
import { Header } from '@/components/ui/header'
import { EmptyState } from '@/components/ui/empty-state'
import { CurriculumProgressCard } from './progress/CurriculumProgressCard'
import type { CallUpload, ScoreDimension } from '@/types'

// Lazy load chart components (Recharts is 8MB - defer until Progress tab viewed)
const ScoreTrendChart = dynamic(
  () => import('./progress/ScoreTrendChart').then(mod => ({ default: mod.ScoreTrendChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const DimensionRadarChart = dynamic(
  () => import('./progress/DimensionRadarChart').then(mod => ({ default: mod.DimensionRadarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

// Loading skeleton for charts
function ChartSkeleton() {
  return (
    <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg animate-pulse">
      <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
    </div>
  )
}

interface PracticeSession {
  id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number
  created_at: string
  overall_score: number
}

interface ModuleProgress {
  moduleId: number
  completed: boolean
  score: number | null
  completedAt: string | null
}

interface DashboardClientProps {
  initialSessions: PracticeSession[]
  initialSessionsHasMore: boolean
  initialCalls: CallUpload[]
  initialCallsHasMore: boolean
  initialScoreTrends: Array<{ date: string; score: number }>
  initialDimensionAverages: Record<ScoreDimension, number>
  initialCurriculumProgress: ModuleProgress[]
}

export function DashboardClient({
  initialSessions,
  initialSessionsHasMore,
  initialCalls,
  initialCallsHasMore,
  initialScoreTrends,
  initialDimensionAverages,
  initialCurriculumProgress,
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
  const [activeTab, setActiveTab] = useState<'practice' | 'calls' | 'progress'>('practice')

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
              <button
                onClick={() => setActiveTab('progress')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'progress'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-muted-foreground hover:text-navy'
                )}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Progress
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
                  <EmptyState
                    icon={<Mic className="w-8 h-8" />}
                    title="No practice sessions yet"
                    description="Start your first practice session to build your history and track your progress over time."
                    illustration="conversation"
                    action={{
                      label: 'Start Practicing',
                      href: '/practice',
                    }}
                  />
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
                  <EmptyState
                    icon={<FileAudio className="w-8 h-8" />}
                    title="No call analyses yet"
                    description="Upload your real call recordings to get detailed feedback and track your improvement."
                    illustration="upload"
                    action={{
                      label: 'Upload a Call',
                      href: '/analyze',
                    }}
                  />
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

            {activeTab === 'progress' && (
              <div className="space-y-8">
                {/* Curriculum Progress */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h2 className="text-lg font-semibold text-navy mb-4">Curriculum Progress</h2>
                  <CurriculumProgressCard progress={initialCurriculumProgress} />
                </div>

                {/* Performance Charts - 2 column grid on lg */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <h2 className="text-lg font-semibold text-navy mb-4">Score Trend</h2>
                    <ScoreTrendChart data={initialScoreTrends} />
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <h2 className="text-lg font-semibold text-navy mb-4">Skills Breakdown</h2>
                    <DimensionRadarChart data={initialDimensionAverages} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  )
}
