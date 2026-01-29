import type { AdminUser, AdminSession } from '@/lib/actions/admin'
import { getScoreLabel, getScoreColor } from '@/config/rubric'
import { PERSONAS } from '@/config/personas'
import { cn } from '@/lib/utils'
import { Mail, Calendar, Clock, Target, User, Activity } from 'lucide-react'

interface UserDetailCardProps {
  user: AdminUser
  sessions: AdminSession[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function getPersonaName(personaId: string): string {
  return PERSONAS[personaId]?.name || personaId
}

function calculateOverallScore(scores: AdminSession['scores']): number {
  if (scores.length === 0) return 0
  const total = scores.reduce((sum, s) => sum + s.score, 0)
  return Math.round((total / scores.length) * 10) / 10
}

function getScoreBgColor(score: number): string {
  if (score >= 7) return 'bg-green-50 border-green-200'
  if (score >= 5) return 'bg-yellow-50 border-yellow-200'
  if (score > 0) return 'bg-red-50 border-red-200'
  return 'bg-muted border-border'
}

export function UserDetailCard({ user, sessions }: UserDetailCardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user.name || 'No name'}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
            </div>
          </div>
          {user.role && (
            <span className="px-3 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full">
              {user.role}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-xl font-bold text-foreground">{user.session_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-xl font-bold text-foreground">
                {user.average_score > 0 ? (
                  <span className={getScoreColor(user.average_score)}>
                    {user.average_score.toFixed(1)}
                  </span>
                ) : (
                  '--'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-xl font-bold text-foreground">
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-card rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-foreground">Session History</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No practice sessions yet
          </div>
        ) : (
          <div className="divide-y">
            {sessions.map((session) => {
              const overallScore = calculateOverallScore(session.scores)

              return (
                <div key={session.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {getPersonaName(session.persona_id)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.scenario_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.created_at)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatDuration(session.duration_seconds)}
                      </div>
                    </div>
                  </div>

                  {/* Overall Score */}
                  {overallScore > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        Overall:
                      </span>
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-sm font-medium',
                          getScoreBgColor(overallScore),
                          getScoreColor(overallScore)
                        )}
                      >
                        {overallScore.toFixed(1)} - {getScoreLabel(overallScore)}
                      </span>
                    </div>
                  )}

                  {/* Dimension Scores */}
                  {session.scores.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {session.scores.map((score) => (
                        <div
                          key={score.dimension}
                          className={cn(
                            'p-3 rounded-lg border',
                            getScoreBgColor(score.score)
                          )}
                        >
                          <p className="text-xs text-muted-foreground capitalize">
                            {score.dimension.replace(/_/g, ' ')}
                          </p>
                          <p
                            className={cn(
                              'text-lg font-semibold mt-1',
                              getScoreColor(score.score)
                            )}
                          >
                            {score.score.toFixed(1)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
