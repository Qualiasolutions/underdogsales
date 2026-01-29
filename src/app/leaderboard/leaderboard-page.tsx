'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, Crown, Star, Target, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import type { LeaderboardEntry } from '@/types'

// Podium for top 3
const Podium = memo(({ entries }: { entries: LeaderboardEntry[] }) => {
  const [first, second, third] = [
    entries.find(e => e.rank === 1),
    entries.find(e => e.rank === 2),
    entries.find(e => e.rank === 3),
  ]

  const podiumOrder = [second, first, third]

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 mb-10 pt-8">
      {podiumOrder.map((entry, index) => {
        if (!entry) return <div key={index} className="w-24 sm:w-28" />
        const isFirst = entry.rank === 1
        const isCurrentUser = entry.is_current_user

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center"
          >
            {/* Crown for #1 */}
            {isFirst && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mb-2"
              >
                <Crown className="w-6 h-6 text-gold" />
              </motion.div>
            )}

            {/* Avatar */}
            <div className={cn(
              'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl mb-3 transition-all',
              isFirst
                ? 'bg-gradient-to-br from-gold to-gold-light text-primary-foreground shadow-lg shadow-gold/20'
                : entry.rank === 2
                ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 dark:from-slate-600 dark:to-slate-500 dark:text-slate-100'
                : 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800 dark:from-amber-700 dark:to-amber-600 dark:text-amber-100',
              isCurrentUser && 'ring-2 ring-gold ring-offset-2 ring-offset-background'
            )}>
              {entry.avatar_initial}
            </div>

            {/* Name */}
            <p className={cn(
              'text-sm font-medium mb-1 max-w-[80px] sm:max-w-[100px] truncate text-center',
              isCurrentUser ? 'text-gold' : 'text-foreground'
            )}>
              {entry.display_name}
            </p>

            {/* Score */}
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Star className="w-3.5 h-3.5 text-gold" />
              <span className="font-medium text-foreground">{entry.avg_score}</span>
            </div>

            {/* Podium Stand */}
            <div className={cn(
              'w-20 sm:w-24 rounded-t-xl mt-3 flex items-start justify-center pt-3',
              isFirst ? 'h-20 bg-gold/10' : entry.rank === 2 ? 'h-14 bg-muted/50' : 'h-10 bg-amber-500/10 dark:bg-amber-500/5'
            )}>
              <span className={cn(
                'text-2xl font-bold',
                isFirst ? 'text-gold' : entry.rank === 2 ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'
              )}>
                {entry.rank}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})
Podium.displayName = 'Podium'

// Leaderboard row
const LeaderboardRow = memo(({ entry, index }: { entry: LeaderboardEntry; index: number }) => {
  const isCurrentUser = entry.is_current_user

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-all duration-200',
        isCurrentUser
          ? 'bg-gold/5 border border-gold/20'
          : 'hover:bg-muted/30'
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center">
        <span className="text-sm font-medium text-muted-foreground">
          {entry.rank}
        </span>
      </div>

      {/* Avatar */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center font-medium text-sm',
        isCurrentUser
          ? 'bg-gold/10 text-gold'
          : 'bg-muted text-muted-foreground'
      )}>
        {entry.avatar_initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm truncate',
          isCurrentUser && 'text-gold'
        )}>
          {entry.display_name}
          {isCurrentUser && <span className="text-muted-foreground ml-1 text-xs">(You)</span>}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {entry.total_sessions}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {entry.total_practice_minutes}m
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1">
        <Star className={cn(
          'w-4 h-4',
          entry.avg_score >= 8 ? 'text-gold' : 'text-muted-foreground/50'
        )} />
        <span className="text-lg font-semibold">{entry.avg_score}</span>
      </div>
    </motion.div>
  )
})
LeaderboardRow.displayName = 'LeaderboardRow'

// Quick stats
const QuickStats = memo(({ entries }: { entries: LeaderboardEntry[] }) => {
  const totalSessions = entries.reduce((sum, e) => sum + e.total_sessions, 0)
  const avgScore = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.avg_score, 0) / entries.length).toFixed(1)
    : '0'

  return (
    <div className="flex items-center justify-center gap-6 mb-8 text-sm">
      <div className="text-center">
        <p className="text-2xl font-semibold text-foreground">{entries.length}</p>
        <p className="text-xs text-muted-foreground">Active</p>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="text-center">
        <p className="text-2xl font-semibold text-foreground">{totalSessions}</p>
        <p className="text-xs text-muted-foreground">Sessions</p>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="text-center">
        <p className="text-2xl font-semibold text-foreground">{avgScore}</p>
        <p className="text-xs text-muted-foreground">Avg Score</p>
      </div>
    </div>
  )
})
QuickStats.displayName = 'QuickStats'

// Loading state
const LoadingSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="flex justify-center gap-4 mb-10 pt-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted mb-3" />
          <div className="w-20 h-4 bg-muted rounded mb-2" />
          <div className={cn('w-24 rounded-t-xl bg-muted', i === 2 ? 'h-20' : i === 1 ? 'h-14' : 'h-10')} />
        </div>
      ))}
    </div>
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex items-center gap-4 p-4">
        <div className="w-8 h-4 bg-muted rounded" />
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 bg-muted rounded" />
          <div className="w-24 h-3 bg-muted rounded" />
        </div>
        <div className="w-12 h-6 bg-muted rounded" />
      </div>
    ))}
  </div>
)

// Empty state
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16"
  >
    <div className="w-16 h-16 rounded-2xl bg-gold/10 mx-auto mb-4 flex items-center justify-center">
      <Trophy className="w-8 h-8 text-gold" />
    </div>
    <h2 className="text-lg font-semibold mb-2">Be the first</h2>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
      Start practicing to appear on the leaderboard
    </p>
    <a
      href="/practice"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-primary-foreground font-medium text-sm hover:bg-gold/90 transition-colors"
    >
      Start Practice
      <ChevronRight className="w-4 h-4" />
    </a>
  </motion.div>
)

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const currentUser = leaderboard.find(e => e.is_current_user)
  const topThree = leaderboard.filter(e => e.rank <= 3)
  const restOfLeaderboard = leaderboard.filter(e => e.rank > 3)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top performers this month</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-sm text-error mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Try again
                </button>
              </motion.div>
            ) : leaderboard.length === 0 ? (
              <EmptyState />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Quick Stats */}
                <QuickStats entries={leaderboard} />

                {/* Your Position (if not in top 3) */}
                {currentUser && currentUser.rank > 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl border border-gold/20 bg-gold/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gold">#{currentUser.rank}</span>
                        <div>
                          <p className="text-sm font-medium">Your Position</p>
                          <p className="text-xs text-muted-foreground">{currentUser.total_sessions} sessions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-gold" />
                        <span className="text-xl font-semibold">{currentUser.avg_score}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Podium */}
                {topThree.length >= 3 && <Podium entries={topThree} />}

                {/* Rankings List */}
                <div className="rounded-2xl border border-border/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rankings
                    </span>
                  </div>
                  <div className="divide-y divide-border/30">
                    {(restOfLeaderboard.length > 0 ? restOfLeaderboard : topThree).map((entry, i) => (
                      <LeaderboardRow key={entry.user_id} entry={entry} index={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  )
}
