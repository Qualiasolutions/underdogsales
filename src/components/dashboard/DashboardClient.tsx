'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'
import { Mic, FileAudio, Loader2, BarChart3, TrendingUp, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getUserPracticeSessions } from '@/lib/actions/practice-session'
import { getUserCallUploads } from '@/lib/actions/call-analysis'
import { SessionHistoryCard } from './SessionHistoryCard'
import { CallHistoryCard } from './CallHistoryCard'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { EmptyState } from '@/components/ui/empty-state'
import { CurriculumProgressCard } from './progress/CurriculumProgressCard'
import type { CallUpload, ScoreDimension } from '@/types'

// Lazy load chart components
const ScoreTrendChart = dynamic(
  () => import('./progress/ScoreTrendChart').then(mod => ({ default: mod.ScoreTrendChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

const DimensionRadarChart = dynamic(
  () => import('./progress/DimensionRadarChart').then(mod => ({ default: mod.DimensionRadarChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

function ChartSkeleton() {
  return (
    <div className="h-64 flex items-center justify-center rounded-xl bg-muted/50">
      <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
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

// Quick stats component
function QuickStats({ sessions }: { sessions: PracticeSession[] }) {
  const totalSessions = sessions.length
  const avgScore = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.overall_score, 0) / sessions.length).toFixed(1)
    : '—'
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60)

  const stats = [
    { label: 'Sessions', value: totalSessions, icon: Target, color: 'text-emerald-500' },
    { label: 'Avg Score', value: avgScore, icon: TrendingUp, color: 'text-gold' },
    { label: 'Minutes', value: totalMinutes, icon: Clock, color: 'text-blue-500' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
            <stat.icon className={cn('w-5 h-5', stat.color)} />
          </div>
        </motion.div>
      ))}
    </div>
  )
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

  const [sessions, setSessions] = useState(initialSessions)
  const [sessionsHasMore, setSessionsHasMore] = useState(initialSessionsHasMore)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsOffset, setSessionsOffset] = useState(0)

  const [calls, setCalls] = useState(initialCalls)
  const [callsHasMore, setCallsHasMore] = useState(initialCallsHasMore)
  const [callsLoading, setCallsLoading] = useState(false)
  const [callsOffset, setCallsOffset] = useState(0)

  const [activeTab, setActiveTab] = useState<'practice' | 'calls' | 'progress'>('practice')

  const handleSessionClick = (sessionId: string) => router.push(`/practice/results/${sessionId}`)
  const handleCallClick = (callId: string) => router.push(`/analyze/${callId}`)

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

  const tabs = [
    { id: 'practice' as const, label: 'Practice', icon: Mic },
    { id: 'calls' as const, label: 'Calls', icon: FileAudio },
    { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your practice activity and progress
            </p>
          </motion.div>

          {/* Quick Stats */}
          <QuickStats sessions={sessions} />

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    activeTab === tab.id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-background border border-border/80 rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'practice' && (
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <EmptyState
                      icon={<Mic className="w-6 h-6" />}
                      title="No practice sessions"
                      description="Start practicing to track your progress"
                      illustration="conversation"
                      action={{ label: 'Start Practice', href: '/practice' }}
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
                          variant="ghost"
                          onClick={loadMoreSessions}
                          disabled={sessionsLoading}
                          className="w-full mt-2 text-muted-foreground hover:text-foreground"
                        >
                          {sessionsLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Load more'
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'calls' && (
                <div className="space-y-2">
                  {calls.length === 0 ? (
                    <EmptyState
                      icon={<FileAudio className="w-6 h-6" />}
                      title="No call analyses"
                      description="Upload recordings for AI feedback"
                      illustration="upload"
                      action={{ label: 'Upload Call', href: '/analyze' }}
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
                          variant="ghost"
                          onClick={loadMoreCalls}
                          disabled={callsLoading}
                          className="w-full mt-2 text-muted-foreground hover:text-foreground"
                        >
                          {callsLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Load more'
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {/* Curriculum */}
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Curriculum</h2>
                    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
                      <CurriculumProgressCard progress={initialCurriculumProgress} />
                    </div>
                  </section>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <section>
                      <h2 className="text-sm font-medium text-muted-foreground mb-3">Score Trend</h2>
                      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
                        <ScoreTrendChart data={initialScoreTrends} />
                      </div>
                    </section>
                    <section>
                      <h2 className="text-sm font-medium text-muted-foreground mb-3">Skills</h2>
                      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
                        <DimensionRadarChart data={initialDimensionAverages} />
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
