'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Clock,
  Target,
  Crown,
  Star,
  Zap,
  ChevronUp,
  Users,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/ui/header'
import type { LeaderboardEntry } from '@/types'

// Podium component for top 3
const Podium = memo(({ entries }: { entries: LeaderboardEntry[] }) => {
  const [first, second, third] = [
    entries.find(e => e.rank === 1),
    entries.find(e => e.rank === 2),
    entries.find(e => e.rank === 3),
  ]

  const podiumOrder = [second, first, third]
  const heights = ['h-28', 'h-36', 'h-24']
  const delays = [0.2, 0, 0.3]

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12">
      {podiumOrder.map((entry, index) => {
        if (!entry) return <div key={index} className="w-24 sm:w-32" />
        const isFirst = entry.rank === 1
        const isCurrentUser = entry.is_current_user

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delays[index], type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center"
          >
            {/* Avatar */}
            <motion.div
              className={cn(
                'relative mb-3',
                isFirst && 'scale-110'
              )}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {isFirst && (
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-8 h-8 text-gold drop-shadow-lg" />
                </motion.div>
              )}
              <div
                className={cn(
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg',
                  isFirst
                    ? 'bg-gradient-to-br from-gold via-gold-light to-gold text-foreground ring-4 ring-gold/30'
                    : entry.rank === 2
                    ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 ring-2 ring-slate-300/50'
                    : 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100 ring-2 ring-amber-500/50',
                  isCurrentUser && 'ring-4 ring-navy dark:ring-gold'
                )}
              >
                {entry.avatar_initial}
              </div>
              {entry.trend === 'hot' && (
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-error flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </motion.div>

            {/* Name */}
            <p className={cn(
              'font-bold text-sm sm:text-base mb-1 text-center truncate max-w-[100px] sm:max-w-[120px]',
              isCurrentUser ? 'text-gold' : 'text-foreground'
            )}>
              {entry.display_name}
              {isCurrentUser && ' (You)'}
            </p>

            {/* Score */}
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 text-gold" />
              <span className="font-bold text-lg">{entry.avg_score}</span>
            </div>

            {/* Podium stand */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              transition={{ delay: delays[index] + 0.2, duration: 0.5 }}
              className={cn(
                'w-24 sm:w-32 rounded-t-xl flex flex-col items-center justify-start pt-4',
                heights[index],
                isFirst
                  ? 'bg-gradient-to-t from-gold/80 to-gold'
                  : entry.rank === 2
                  ? 'bg-gradient-to-t from-slate-400/80 to-slate-300'
                  : 'bg-gradient-to-t from-amber-700/80 to-amber-600'
              )}
            >
              <span className={cn(
                'text-3xl sm:text-4xl font-black',
                isFirst ? 'text-foreground' : entry.rank === 2 ? 'text-slate-700' : 'text-amber-100'
              )}>
                {entry.rank}
              </span>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
})
Podium.displayName = 'Podium'

// Single leaderboard row
const LeaderboardRow = memo(({
  entry,
  index,
}: {
  entry: LeaderboardEntry
  index: number
}) => {
  const isTopThree = entry.rank <= 3
  const isCurrentUser = entry.is_current_user

  const trendIcons = {
    hot: <Flame className="w-4 h-4 text-error" />,
    rising: <TrendingUp className="w-4 h-4 text-success" />,
    steady: <ChevronUp className="w-4 h-4 text-muted-foreground rotate-90" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-colors',
        isCurrentUser
          ? 'bg-gradient-to-r from-gold/10 to-transparent border border-gold/30'
          : 'hover:bg-muted/50',
        isTopThree && !isCurrentUser && 'bg-muted/30'
      )}
    >
      {/* Rank */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0',
        entry.rank === 1 && 'bg-gradient-to-br from-gold to-gold-light text-foreground',
        entry.rank === 2 && 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700',
        entry.rank === 3 && 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
        entry.rank > 3 && 'bg-muted text-muted-foreground'
      )}>
        {entry.rank}
      </div>

      {/* Avatar */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0',
        isCurrentUser
          ? 'bg-gradient-to-br from-navy to-navy-light text-white dark:from-gold dark:to-gold-light dark:text-foreground'
          : 'bg-gradient-to-br from-muted to-muted/50 text-foreground'
      )}>
        {entry.avatar_initial}
      </div>

      {/* Name & Stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'font-bold truncate',
            isCurrentUser && 'text-gold'
          )}>
            {entry.display_name}
            {isCurrentUser && <span className="text-xs ml-1 text-muted-foreground">(You)</span>}
          </p>
          {entry.trend === 'hot' && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {trendIcons.hot}
            </motion.span>
          )}
          {entry.trend === 'rising' && trendIcons.rising}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {entry.total_sessions} sessions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {entry.total_practice_minutes}m
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Star className={cn(
            'w-5 h-5',
            entry.avg_score >= 8 ? 'text-gold' : entry.avg_score >= 6 ? 'text-emerald-500' : 'text-muted-foreground'
          )} />
          <span className="text-xl font-bold">{entry.avg_score}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Best: {entry.best_score}
        </p>
      </div>
    </motion.div>
  )
})
LeaderboardRow.displayName = 'LeaderboardRow'

// Stats cards
const StatsSection = memo(({ entries, currentUser }: { entries: LeaderboardEntry[]; currentUser?: LeaderboardEntry }) => {
  const totalSessions = entries.reduce((sum, e) => sum + e.total_sessions, 0)
  const totalMinutes = entries.reduce((sum, e) => sum + e.total_practice_minutes, 0)
  const avgScore = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.avg_score, 0) / entries.length).toFixed(1)
    : '0'

  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      value: entries.length,
      label: 'Active Underdogs',
      color: 'text-navy dark:text-gold',
    },
    {
      icon: <Target className="w-5 h-5" />,
      value: totalSessions,
      label: 'Total Sessions',
      color: 'text-emerald-500',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      value: `${Math.round(totalMinutes / 60)}h`,
      label: 'Practice Time',
      color: 'text-blue-500',
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: avgScore,
      label: 'Avg Score',
      color: 'text-gold',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card variant="elevated" className="p-4 text-center">
            <div className={cn('mx-auto mb-2', stat.color)}>{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  )
})
StatsSection.displayName = 'StatsSection'

// Your position card
const YourPositionCard = memo(({ entry }: { entry: LeaderboardEntry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mb-8"
  >
    <Card variant="navy" className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <span className="text-3xl font-bold text-white dark:text-foreground">#{entry.rank}</span>
        </div>
        <div className="flex-1">
          <p className="text-white/60 dark:text-foreground/60 text-sm">Your Position</p>
          <p className="text-white dark:text-foreground text-xl font-bold">{entry.display_name}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <Star className="w-6 h-6 text-gold" />
            <span className="text-3xl font-bold text-white dark:text-foreground">{entry.avg_score}</span>
          </div>
          <p className="text-white/60 dark:text-foreground/60 text-sm">
            {entry.total_sessions} sessions
          </p>
        </div>
      </div>
      {entry.rank > 1 && (
        <div className="mt-4 pt-4 border-t border-white/10 dark:border-foreground/10">
          <p className="text-white/80 dark:text-foreground/80 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold" />
            Keep practicing to climb the ranks!
          </p>
        </div>
      )}
    </Card>
  </motion.div>
))
YourPositionCard.displayName = 'YourPositionCard'

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex justify-center gap-6 mb-12">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-muted mb-3" />
          <div className="w-24 h-4 bg-muted rounded mb-2" />
          <div className={cn('w-32 rounded-t-xl bg-muted', i === 2 ? 'h-36' : i === 1 ? 'h-28' : 'h-24')} />
        </div>
      ))}
    </div>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="flex-1">
          <div className="w-32 h-4 bg-muted rounded mb-2" />
          <div className="w-24 h-3 bg-muted rounded" />
        </div>
        <div className="w-16 h-8 bg-muted rounded" />
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
    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold/20 to-gold/5 mx-auto mb-6 flex items-center justify-center">
      <Trophy className="w-12 h-12 text-gold" />
    </div>
    <h2 className="text-2xl font-bold mb-2">Be the First Champion!</h2>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      The leaderboard is waiting for its first warrior. Start practicing and claim your spot at the top!
    </p>
    <a
      href="/practice"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light text-foreground font-bold hover:shadow-lg hover:shadow-gold/20 transition-all"
    >
      <Sparkles className="w-5 h-5" />
      Start Practicing
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
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
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
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold mb-4">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Sales Warriors</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
              <span className="text-gradient-gold">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Compete, improve, and dominate. See how you stack up against other Underdog warriors.
            </p>
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
                <p className="text-error mb-4">{error}</p>
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Stats */}
                <StatsSection entries={leaderboard} currentUser={currentUser} />

                {/* Your Position (if not in top 3) */}
                {currentUser && currentUser.rank > 3 && (
                  <YourPositionCard entry={currentUser} />
                )}

                {/* Podium */}
                {topThree.length >= 3 && <Podium entries={topThree} />}

                {/* Leaderboard list */}
                <Card variant="elevated" className="overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2">
                      <Medal className="w-5 h-5 text-gold" />
                      Rankings
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      Last 30 days
                    </span>
                  </div>
                  <CardContent className="p-2 divide-y divide-border/50">
                    {restOfLeaderboard.length > 0 ? (
                      restOfLeaderboard.map((entry, i) => (
                        <LeaderboardRow key={entry.user_id} entry={entry} index={i} />
                      ))
                    ) : (
                      topThree.map((entry, i) => (
                        <LeaderboardRow key={entry.user_id} entry={entry} index={i} />
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <a
                    href="/practice"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-foreground font-bold hover:shadow-xl hover:shadow-gold/20 transition-all hover:-translate-y-1"
                  >
                    <Zap className="w-5 h-5" />
                    Practice Now to Climb Higher
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
