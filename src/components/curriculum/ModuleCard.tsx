'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CurriculumModule, CurriculumProgress } from '@/types'
import { Lock, Play, CheckCircle, BookOpen } from 'lucide-react'

interface ModuleCardProps {
  module: CurriculumModule
  progress?: CurriculumProgress | null
  isLocked?: boolean
  onClick: () => void
}

export function ModuleCard({ module, progress, isLocked = false, onClick }: ModuleCardProps) {
  const isCompleted = progress?.completed ?? false
  const isStarted = progress && !progress.completed

  const getStatusIcon = () => {
    if (isLocked) return <Lock className="w-5 h-5" />
    if (isCompleted) return <CheckCircle className="w-5 h-5" />
    if (isStarted) return <BookOpen className="w-5 h-5" />
    return <Play className="w-5 h-5" />
  }

  const getStatusText = () => {
    if (isLocked) return 'Locked'
    if (isCompleted) return 'Completed'
    if (isStarted) return 'In Progress'
    return 'Start'
  }

  const getStatusColor = () => {
    if (isLocked) return 'bg-muted text-muted-foreground'
    if (isCompleted) return 'bg-success-light text-success'
    if (isStarted) return 'bg-gold/15 text-gold-dark'
    return 'bg-navy/10 text-navy'
  }

  return (
    <Card
      hover={!isLocked}
      variant="bordered"
      className={cn(
        'relative overflow-hidden cursor-pointer group',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
      onClick={() => !isLocked && onClick()}
    >
      {/* Module number badge */}
      <div className="absolute top-4 left-4">
        <span
          className={cn(
            'inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm',
            isCompleted ? 'bg-success text-white' : 'bg-navy/10 text-navy'
          )}
        >
          {module.id}
        </span>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <motion.div
          className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', getStatusColor())}
          initial={false}
          animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="pt-14 space-y-3">
        <h3
          className={cn(
            'text-lg font-bold transition-colors',
            isLocked ? 'text-muted-foreground' : 'text-navy group-hover:text-navy-light'
          )}
        >
          {module.name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {module.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant={isLocked ? 'outline' : 'default'} size="sm">
              {topic.replace(/_/g, ' ')}
            </Badge>
          ))}
          {module.topics.length > 3 && (
            <Badge variant="outline" size="sm">
              +{module.topics.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar for started modules */}
      {isStarted && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>In Progress</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-gold-light"
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Completed overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-success/5 pointer-events-none" />
      )}

      {/* Arrow indicator on hover */}
      {!isLocked && (
        <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </Card>
  )
}
