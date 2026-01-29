'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { BookOpen, ArrowLeft, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { Badge } from '@/components/ui/badge'

export default function CurriculumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <Header variant="transparent" />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon */}
            <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-8 border border-gold/20">
              <BookOpen className="w-12 h-12 text-gold" />
            </div>

            {/* Badge */}
            <Badge variant="gold" className="mb-6">
              Coming Soon
            </Badge>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              12-Module <span className="text-gradient-gold">Curriculum</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Master the complete Underdog cold calling methodology. From mindset to
              closing, learn everything you need to become a top performer.
            </p>

            {/* Preview Card */}
            <Card variant="elevated" className="p-8 mb-8 text-left">
              <h2 className="font-bold text-foreground mb-4">What&apos;s Included:</h2>
              <ul className="space-y-3">
                {[
                  'The Underdog Mindset - Reframe rejection as opportunity',
                  'Pre-Call Research - Know your prospect before you dial',
                  'The Perfect Opener - Hook them in the first 7 seconds',
                  'Qualifying Questions - Identify pain points quickly',
                  'Objection Mastery - Turn "no" into "tell me more"',
                  'The Art of the Close - Secure meetings with confidence',
                  '...and 6 more advanced modules',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/coach">
                <Button variant="gold" size="lg" shine>
                  <Bell className="w-5 h-5" />
                  Practice with Coach Giulio
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground mt-8">
              The full curriculum is being finalized. Practice with Giulio in the
              meantime to start improving your skills today.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
