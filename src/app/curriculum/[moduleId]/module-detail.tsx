'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { CompletionBadge } from '@/components/curriculum/CurriculumProgress'
import { markModuleComplete, markModuleStarted } from '@/lib/actions/curriculum'
import type { CurriculumModule, CurriculumProgress } from '@/types'
import {
  CheckCircle,
  BookOpen,
  Mic,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ModuleDetailProps {
  module: CurriculumModule
  progress: CurriculumProgress | null
  prevModule: CurriculumModule | null
  nextModule: CurriculumModule | null
  totalModules: number
}

export function ModuleDetail({
  module,
  progress,
  prevModule,
  nextModule,
  totalModules,
}: ModuleDetailProps) {
  const [isPending, startTransition] = useTransition()
  const [isCompleted, setIsCompleted] = useState(progress?.completed ?? false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Mark as started when component mounts (if not already started)
  useState(() => {
    if (!progress) {
      markModuleStarted(module.id)
    }
  })

  const handleMarkComplete = () => {
    startTransition(async () => {
      const result = await markModuleComplete(module.id)
      if (result.success) {
        setIsCompleted(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }
    })
  }

  // Parse content into sections (split by ## headers)
  const contentSections = module.content.split(/(?=^## )/m).filter(Boolean)

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Header with auth */}
      <Header />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Module info header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Module {module.id} of {totalModules}
            </p>
            <h1 className="text-2xl font-bold text-foreground">{module.name}</h1>
          </div>
          {isCompleted && <CompletionBadge />}
        </div>

        <div className="space-y-8">
          {/* Module header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-gold-dark" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-2">{module.name}</h2>
                <p className="text-muted-foreground mb-4">{module.description}</p>
                <div className="flex flex-wrap gap-2">
                  {module.topics.map((topic) => (
                    <Badge key={topic} variant="default" size="sm">
                      {topic.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm"
          >
            <div className="prose prose-navy max-w-none">
              {contentSections.map((section, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  {section.split('\n').map((line, lineIndex) => {
                    // H2 headers
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={lineIndex} className="text-lg font-bold text-foreground mt-6 mb-3 first:mt-0">
                          {line.replace('## ', '')}
                        </h2>
                      )
                    }
                    // Bold numbered items
                    if (line.match(/^\d+\. \*\*/)) {
                      const match = line.match(/^(\d+)\. \*\*(.+?)\*\*(.*)/)
                      if (match) {
                        return (
                          <div key={lineIndex} className="flex gap-3 mb-2">
                            <span className="font-bold text-gold-dark">{match[1]}.</span>
                            <p className="text-foreground">
                              <strong>{match[2]}</strong>
                              {match[3]}
                            </p>
                          </div>
                        )
                      }
                    }
                    // Bullet points
                    if (line.startsWith('- ')) {
                      const content = line.replace(/^- /, '')
                      // Check for bold in bullet
                      const boldMatch = content.match(/^\*\*(.+?)\*\*:?\s*(.*)/)
                      if (boldMatch) {
                        return (
                          <div key={lineIndex} className="flex gap-2 mb-2 ml-4">
                            <span className="text-gold-dark">•</span>
                            <p className="text-foreground">
                              <strong>{boldMatch[1]}</strong>
                              {boldMatch[2] && `: ${boldMatch[2]}`}
                            </p>
                          </div>
                        )
                      }
                      return (
                        <div key={lineIndex} className="flex gap-2 mb-2 ml-4">
                          <span className="text-gold-dark">•</span>
                          <p className="text-muted-foreground">{content}</p>
                        </div>
                      )
                    }
                    // Regular paragraphs
                    if (line.trim()) {
                      return (
                        <p key={lineIndex} className="text-muted-foreground mb-2">
                          {line}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                {!isCompleted ? (
                  <Button onClick={handleMarkComplete} loading={isPending} variant="gold" size="lg">
                    <CheckCircle className="w-5 h-5" />
                    Mark as Complete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Module Completed!</span>
                  </div>
                )}
              </div>

              <Link href="/practice">
                <Button variant="secondary" size="lg">
                  <Mic className="w-5 h-5" />
                  Practice This Skill
                </Button>
              </Link>
            </div>
          </motion.section>

          {/* Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            {prevModule ? (
              <Link href={`/curriculum/${prevModule.id}`}>
                <Button variant="ghost" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous:</span> {prevModule.name}
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextModule && (
              <Link href={`/curriculum/${nextModule.id}`}>
                <Button variant="outline" className="gap-2">
                  <span className="hidden sm:inline">Next:</span> {nextModule.name}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </motion.nav>
        </div>
      </main>

      {/* Confetti effect on completion */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
