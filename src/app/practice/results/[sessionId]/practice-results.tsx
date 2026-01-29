'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  CheckCircle,
  XCircle,
  Sparkles,
  RotateCcw,
  Share2,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/ui/header'
import { Badge } from '@/components/ui/badge'
import { celebrationBurst } from '@/components/ui/confetti'
import { getScoreLabel, getScoreColor, SCORING_RUBRIC } from '@/config/rubric'
import type { TranscriptEntry, ScoreDimension, DimensionScore, CallAnalysis } from '@/types'

interface SessionData {
  id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number
  transcript: TranscriptEntry[]
  created_at: string
  overall_score: number
  analysis: CallAnalysis
}

interface PracticeResultsProps {
  session: SessionData
  personaName: string
  personaRole: string
}

const DIMENSION_ORDER: ScoreDimension[] = [
  'opener',
  'pitch',
  'discovery',
  'objection_handling',
  'closing',
  'communication',
]

const DIMENSION_LABELS: Record<ScoreDimension, string> = {
  opener: 'Opener',
  pitch: 'Pitch',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  closing: 'Closing',
  communication: 'Communication',
}

const SCENARIO_LABELS: Record<string, string> = {
  cold_call: 'Cold Call',
  objection: 'Objection Handling',
  closing: 'Closing',
  gatekeeper: 'Gatekeeper Navigation',
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Animated score circle component
function ScoreCircle({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const dimensions = size === 'lg' ? { width: 180, strokeWidth: 10 } : { width: 80, strokeWidth: 6 }
  const radius = (dimensions.width - dimensions.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative" style={{ width: dimensions.width, height: dimensions.width }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dimensions.width} ${dimensions.width}`}>
        {/* Background circle */}
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={dimensions.strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={dimensions.width / 2}
          cy={dimensions.width / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={dimensions.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * score) / 10 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E7B221" />
            <stop offset="100%" stopColor="#F5D75B" />
          </linearGradient>
        </defs>
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('font-bold text-foreground', size === 'lg' ? 'text-5xl' : 'text-2xl')}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className={cn('text-muted-foreground', size === 'lg' ? 'text-sm' : 'text-xs')}>
          / 10
        </span>
      </div>
    </div>
  )
}

// Dimension card with expandable criteria
function DimensionCard({
  dimension,
  score,
  weight,
  index,
}: {
  dimension: ScoreDimension
  score: DimensionScore
  weight: number
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const scoreColor = getScoreColor(score.score)
  const passedCount = score.criteria.filter((c) => c.passed).length
  const totalCount = score.criteria.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index + 0.5 }}
    >
      <Card
        variant="default"
        hover
        className={cn('cursor-pointer transition-all duration-300', isExpanded && 'ring-2 ring-gold/30')}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-foreground">{DIMENSION_LABELS[dimension]}</h4>
              <p className="text-xs text-muted-foreground">Weight: {Math.round(weight * 100)}%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-2xl font-bold', scoreColor)}>{score.score}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-gold-light"
              initial={{ width: 0 }}
              animate={{ width: `${(score.score / 10) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            />
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{score.feedback}</p>

          {/* Expand button */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {passedCount}/{totalCount} criteria passed
            </span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Expanded criteria */}
          <AnimatePresence>
            {isExpanded && score.criteria.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border mt-4 pt-4 space-y-3">
                  {score.criteria.map((criterion) => (
                    <div
                      key={criterion.name}
                      className="flex items-start gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {criterion.passed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize">
                          {criterion.name.replace(/_/g, ' ')}
                        </p>
                        {criterion.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">{criterion.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Feedback list component
function FeedbackList({
  title,
  items,
  variant,
  delay = 0,
}: {
  title: string
  items: string[]
  variant: 'strengths' | 'improvements'
  delay?: number
}) {
  const isStrengths = variant === 'strengths'
  const displayItems = items.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        variant="default"
        className={cn('border', isStrengths ? 'border-emerald-200' : 'border-amber-200')}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isStrengths ? 'bg-emerald-100' : 'bg-amber-100'
              )}
            >
              {isStrengths ? (
                <Trophy className="w-5 h-5 text-emerald-600" />
              ) : (
                <Target className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>

          {/* List */}
          {displayItems.length > 0 ? (
            <ul className="space-y-3">
              {displayItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.1 + i * 0.1 }}
                  className="flex gap-3 text-sm"
                >
                  <span
                    className={cn(
                      'font-bold flex-shrink-0',
                      isStrengths ? 'text-emerald-600' : 'text-amber-600'
                    )}
                  >
                    {i + 1}.
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No {variant} identified</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Transcript message
function TranscriptMessage({
  entry,
  personaName,
  isUser,
}: {
  entry: TranscriptEntry
  personaName: string
  isUser: boolean
}) {
  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : '')}>
      <div
        className={cn(
          'w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-navy to-navy-light text-white'
            : 'bg-gradient-to-br from-gold/20 to-gold/10 text-gold-dark border border-gold/20'
        )}
      >
        {isUser
          ? 'You'
          : personaName
              .split(' ')
              .map((n) => n[0])
              .join('')}
      </div>
      <div
        className={cn(
          'flex-1 py-3 px-4 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-navy to-navy-light text-white rounded-tr-md'
            : 'bg-card border border-border text-foreground rounded-tl-md'
        )}
      >
        {entry.content}
      </div>
    </div>
  )
}

export function PracticeResults({ session, personaName, personaRole }: PracticeResultsProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const scoreLabel = getScoreLabel(session.overall_score)
  const scoreColor = getScoreColor(session.overall_score)

  // Trigger celebration for high scores (7.5+)
  useEffect(() => {
    if (session.overall_score >= 7.5) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        celebrationBurst()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [session.overall_score])

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <Header variant="transparent" />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href="/practice">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Practice
              </Button>
            </Link>
          </motion.div>

          {/* Hero Section - Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" className="overflow-hidden mb-8">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/10 to-transparent pointer-events-none" />

              <CardContent className="relative p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className="flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                      <ScoreCircle score={session.overall_score} size="lg" />
                    </motion.div>
                  </div>

                  {/* Summary */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                      >
                        <Sparkles className="w-6 h-6 text-gold" />
                      </motion.div>
                      <h1 className={cn('text-3xl font-bold', scoreColor)}>{scoreLabel}</h1>
                    </div>

                    <p className="text-muted-foreground text-lg mb-6">{session.analysis.summary}</p>

                    {/* Session meta */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
                      <Badge variant="navy">
                        <User className="w-3 h-3" />
                        {personaName} ({personaRole})
                      </Badge>
                      <Badge variant="default">
                        <MessageSquare className="w-3 h-3" />
                        {SCENARIO_LABELS[session.scenario_type] || session.scenario_type}
                      </Badge>
                      <Badge variant="default">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.duration_seconds)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FeedbackList
              title="Strengths"
              items={session.analysis.strengths}
              variant="strengths"
              delay={0.3}
            />
            <FeedbackList
              title="Areas for Improvement"
              items={session.analysis.improvements}
              variant="improvements"
              delay={0.4}
            />
          </div>

          {/* Dimension Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Score Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIMENSION_ORDER.map((dimension, index) => {
                const score = session.analysis.scores[dimension]
                const rubric = SCORING_RUBRIC.find((r) => r.dimension === dimension)
                if (!score || !rubric) return null

                return (
                  <DimensionCard
                    key={dimension}
                    dimension={dimension}
                    score={score}
                    weight={rubric.weight}
                    index={index}
                  />
                )
              })}
            </div>
          </motion.div>

          {/* Transcript Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card variant="default">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                  <h2 className="text-lg font-bold text-foreground">Conversation Transcript</h2>
                  <Badge variant="outline">{session.transcript.length} messages</Badge>
                </div>
                <motion.div animate={{ rotate: showTranscript ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-6 py-4 max-h-[500px] overflow-y-auto space-y-4">
                      {session.transcript.map((entry, i) => (
                        <TranscriptMessage
                          key={i}
                          entry={entry}
                          personaName={personaName}
                          isUser={entry.role === 'user'}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/practice">
              <Button variant="gold" size="lg" shine>
                <RotateCcw className="w-5 h-5" />
                Practice Again
              </Button>
            </Link>
            <Button variant="outline" size="lg" disabled>
              <Share2 className="w-5 h-5" />
              Share Results
            </Button>
            <Button variant="ghost" size="lg" disabled>
              <Download className="w-5 h-5" />
              Export PDF
            </Button>
          </motion.div>

          {/* Session info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Session completed {formatDate(session.created_at)}
          </motion.p>
        </div>
      </main>
    </div>
  )
}
