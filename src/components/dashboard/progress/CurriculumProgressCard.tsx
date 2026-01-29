'use client'

import { cn } from '@/lib/utils'
import {
  OverallProgressBar,
  CurriculumStats,
} from '@/components/curriculum/CurriculumProgress'
import { ModuleBreakdown } from './ModuleBreakdown'

interface ModuleProgress {
  moduleId: number
  completed: boolean
  score: number | null
  completedAt: string | null
}

interface CurriculumProgressCardProps {
  progress: ModuleProgress[]
  className?: string
}

const TOTAL_MODULES = 12

export function CurriculumProgressCard({ progress, className }: CurriculumProgressCardProps) {
  const completedCount = progress.filter((p) => p.completed).length

  return (
    <div className={cn('space-y-6', className)}>
      <OverallProgressBar completed={completedCount} total={TOTAL_MODULES} />

      <CurriculumStats completed={completedCount} total={TOTAL_MODULES} />

      <div className="pt-2">
        <h3 className="text-sm font-medium text-foreground mb-3">Module Progress</h3>
        <ModuleBreakdown progress={progress} />
      </div>
    </div>
  )
}
