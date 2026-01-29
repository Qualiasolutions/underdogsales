'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Monitor,
  Heart,
  Landmark,
  Building2,
  Factory,
  Briefcase,
  Check,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Header } from '@/components/ui/header'
import { cn } from '@/lib/utils'

interface Industry {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  examples: string[]
}

const INDUSTRIES: Industry[] = [
  {
    id: 'saas_tech',
    name: 'SaaS / Tech',
    description: 'Software, cloud services, IT solutions',
    icon: <Monitor className="w-6 h-6" />,
    examples: ['CRM', 'Analytics', 'Security', 'DevOps'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical, pharma, health services',
    icon: <Heart className="w-6 h-6" />,
    examples: ['Medical devices', 'Health IT', 'Pharma sales'],
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Banking, insurance, fintech',
    icon: <Landmark className="w-6 h-6" />,
    examples: ['Banking solutions', 'Insurance', 'Investment'],
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Commercial & residential property',
    icon: <Building2 className="w-6 h-6" />,
    examples: ['Commercial', 'Residential', 'PropTech'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial, production, supply chain',
    icon: <Factory className="w-6 h-6" />,
    examples: ['Equipment', 'Materials', 'Automation'],
  },
  {
    id: 'professional_services',
    name: 'Professional Services',
    description: 'Consulting, legal, accounting',
    icon: <Briefcase className="w-6 h-6" />,
    examples: ['Consulting', 'Legal', 'HR services'],
  },
]

export function IndustrySelector() {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    if (!selected || saving) return

    setSaving(true)
    try {
      const response = await fetch('/api/user/industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: selected }),
      })

      if (!response.ok) throw new Error('Failed to save')

      router.push('/practice')
    } catch (error) {
      console.error('Save error:', error)
      setSaving(false)
    }
  }

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
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              What do you <span className="text-gradient-gold">sell</span>?
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Pick your industry. This helps our AI personas roleplay with relevant
              objections, terminology, and scenarios.
            </p>
          </motion.div>

          {/* Industry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {INDUSTRIES.map((industry, index) => (
              <motion.button
                key={industry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelected(industry.id)}
                className={cn(
                  'relative p-6 rounded-2xl border-2 text-left transition-all',
                  'hover:border-gold/50 hover:bg-gold/5',
                  selected === industry.id
                    ? 'border-gold bg-gold/10 ring-2 ring-gold/20'
                    : 'border-border bg-card'
                )}
              >
                {/* Selected check */}
                {selected === industry.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-foreground" />
                  </motion.div>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                    selected === industry.id
                      ? 'bg-gold/20 text-gold'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {industry.icon}
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg mb-1">{industry.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {industry.description}
                </p>

                {/* Examples */}
                <div className="flex flex-wrap gap-1.5">
                  {industry.examples.map((example) => (
                    <span
                      key={example}
                      className="text-xs bg-muted/50 px-2 py-0.5 rounded-full text-muted-foreground"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: selected ? 1 : 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={handleContinue}
              disabled={!selected || saving}
              className={cn(
                'flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all',
                'bg-gradient-to-r from-gold to-gold-light text-foreground',
                'hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-1',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Practice
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>

          {/* Skip option */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            You can change this anytime in{' '}
            <a href="/settings" className="underline hover:text-foreground">
              Settings
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
