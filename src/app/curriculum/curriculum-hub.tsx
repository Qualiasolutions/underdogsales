'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ModuleCard } from '@/components/curriculum/ModuleCard'
import { OverallProgressBar, CurriculumStats } from '@/components/curriculum/CurriculumProgress'
import type { CurriculumModule, CurriculumProgress } from '@/types'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CurriculumHubProps {
  modules: CurriculumModule[]
  progress: CurriculumProgress[]
}

export function CurriculumHub({ modules, progress }: CurriculumHubProps) {
  const router = useRouter()

  // Create a map of module progress for quick lookup
  const progressMap = new Map(progress.map((p) => [p.module_id, p]))

  // Count completed modules
  const completedCount = progress.filter((p) => p.completed).length

  const handleModuleClick = useCallback(
    (moduleId: number) => {
      router.push(`/curriculum/${moduleId}`)
    },
    [router]
  )

  // Check if a module is locked (only first module is always unlocked)
  const isModuleLocked = (moduleId: number) => {
    if (moduleId === 1) return false

    // Module is unlocked if the previous module is completed
    const prevProgress = progressMap.get(moduleId - 1)
    return !prevProgress?.completed
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/practice">
                <Button variant="ghost" size="icon-sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-navy">Underdog Methodology</h1>
                  <p className="text-sm text-muted-foreground">12 modules to master cold calling</p>
                </div>
              </div>
            </div>
            <Link href="/practice">
              <Button variant="secondary" size="sm">
                Practice Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Progress section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-border p-6 shadow-sm"
        >
          <OverallProgressBar completed={completedCount} total={modules.length} />
          <div className="mt-6">
            <CurriculumStats completed={completedCount} total={modules.length} />
          </div>
        </motion.section>

        {/* Module grid */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4">Course Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ModuleCard
                  module={module}
                  progress={progressMap.get(module.id)}
                  isLocked={isModuleLocked(module.id)}
                  onClick={() => handleModuleClick(module.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Completion message */}
        {completedCount === modules.length && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold/20 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Congratulations!</h3>
            <p className="text-muted-foreground mb-4">
              You've completed the entire Underdog Methodology curriculum. Now it's time to put your
              skills into practice!
            </p>
            <Link href="/practice">
              <Button variant="gold" size="lg">
                Start Practicing
              </Button>
            </Link>
          </motion.section>
        )}
      </main>
    </div>
  )
}
