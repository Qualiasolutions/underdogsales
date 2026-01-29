'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  Phone,
  Upload,
  BookOpen,
  BarChart3,
  Mic,
  ArrowRight,
  Target,
  TrendingUp,
  Award,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, FeatureCard, StatCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FadeIn,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  Float,
  VoiceVisualizer,
  PulseRing,
  Counter,
  Glow,
} from '@/components/ui/motion'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/underdog-logo.png"
                alt="Underdog Sales"
                width={140}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/coach" className="text-sm font-medium text-navy/70 hover:text-navy transition-colors link-underline">
                Coach
              </Link>
              <Link href="/chat" className="text-sm font-medium text-navy/70 hover:text-navy transition-colors link-underline">
                Chat
              </Link>
              <Link href="/curriculum" className="text-sm font-medium text-navy/70 hover:text-navy transition-colors link-underline">
                Curriculum
              </Link>
              <Link href="#features" className="text-sm font-medium text-navy/70 hover:text-navy transition-colors link-underline">
                Features
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Auth buttons */}
              {!loading && (
                <>
                  {user ? (
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                        <User className="w-4 h-4 text-navy" />
                        <span className="text-sm font-medium text-navy truncate max-w-[120px]">
                          {user.email?.split('@')[0]}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={signOut}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login" className="hidden sm:block">
                      <Button variant="primary" size="sm">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-navy" />
                ) : (
                  <Menu className="w-6 h-6 text-navy" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50 bg-white"
            >
              <div className="px-6 py-4 space-y-3">
                <Link
                  href="/coach"
                  className="block py-2 text-sm font-medium text-navy/70 hover:text-navy transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Coach
                </Link>
                <Link
                  href="/chat"
                  className="block py-2 text-sm font-medium text-navy/70 hover:text-navy transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chat
                </Link>
                <Link
                  href="/curriculum"
                  className="block py-2 text-sm font-medium text-navy/70 hover:text-navy transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Curriculum
                </Link>
                <Link
                  href="#features"
                  className="block py-2 text-sm font-medium text-navy/70 hover:text-navy transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>

                {/* Mobile auth */}
                {!loading && (
                  <div className="pt-3 border-t border-border">
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                          <User className="w-4 h-4 text-navy" />
                          <span className="text-sm font-medium text-navy">
                            {user.email}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            signOut()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        className="block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="primary" size="sm" className="w-full">
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <FadeIn delay={0.1}>
                <h1 className="text-5xl lg:text-6xl font-black text-navy leading-[1.1] mb-6 font-[family-name:var(--font-maven-pro)]">
                  Master Cold Calling
                  <br />
                  <span className="text-gradient-gold">Like a Pro</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  Practice with AI-powered prospect simulations, get real-time coaching,
                  and receive detailed feedback based on the proven Underdog methodology.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/practice">
                    <Button variant="gold" size="xl" className="w-full sm:w-auto">
                      <Phone className="w-5 h-5" />
                      Start Practicing Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/curriculum">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">
                      <BookOpen className="w-5 h-5" />
                      View Curriculum
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex items-center gap-6 mt-10 pt-10 border-t border-border">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-navy/20 border-2 border-white flex items-center justify-center text-xs font-bold text-navy"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      <Counter value={500} suffix="+" /> sales professionals trained
                    </p>
                    <p className="text-xs text-muted-foreground">Join them today</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Content - Voice Practice Preview */}
            <FadeIn delay={0.2} direction="left">
              <div className="relative">
                <Glow color="gold">
                  <Card variant="elevated" className="p-8 relative overflow-hidden">
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold/10 to-transparent" />

                    <div className="relative">
                      {/* Coach Profile */}
                      <div className="flex items-center gap-4 mb-8">
                        <img
                          src="/coach.png"
                          alt="AI Sales Coach"
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-2xl border-2 border-gold bg-gradient-to-br from-gold/20 to-gold/5 object-contain"
                        />
                        <div>
                          <p className="font-bold text-navy">Your AI Coach</p>
                          <p className="text-sm text-muted-foreground">Ready to practice</p>
                        </div>
                        <Badge variant="success" className="ml-auto" dot pulse>
                          Live
                        </Badge>
                      </div>

                      {/* Voice Visualizer */}
                      <div className="bg-muted rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-center gap-4 h-20">
                          <Float duration={2} distance={5}>
                            <VoiceVisualizer active barCount={7} className="h-16" />
                          </Float>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                          &ldquo;I appreciate you calling, but can you tell me the ROI on this?&rdquo;
                        </p>
                      </div>

                      {/* Call Controls */}
                      <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Mic className="w-5 h-5" />
                        </Button>
                        <PulseRing active color="error">
                          <Button variant="danger" size="icon-lg" className="rounded-full">
                            <Phone className="w-6 h-6" />
                          </Button>
                        </PulseRing>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <BarChart3 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Glow>

                {/* Floating Badge */}
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Badge variant="navy" size="lg">
                    <Award className="w-4 h-4" />
                    Real-time Feedback
                  </Badge>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StaggerItem>
              <StatCard
                value={<><Counter value={500} />+</>}
                label="Individuals Trained"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                value={<><Counter value={20} />+</>}
                label="Companies Consulted"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                value={<><Counter value={6} /></>}
                label="AI Personas"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                value={<><Counter value={12} /></>}
                label="Training Modules"
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="gold" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-navy mb-4 font-[family-name:var(--font-maven-pro)]">
              Everything You Need to
              <br />
              <span className="text-gradient-gold">Close More Deals</span>
            </h2>
            <p className="text-muted-foreground">
              A complete AI-powered training platform built on proven sales methodology
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
              <Link href="/practice">
                <FeatureCard
                  icon={<Phone className="w-7 h-7" />}
                  title="Voice Role-Play"
                  description="Practice with 6 realistic AI personas including skeptical CFOs, busy VPs, and protective gatekeepers."
                />
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <FeatureCard
                icon={<Upload className="w-7 h-7" />}
                title="Call Analysis"
                description="Upload your real call recordings and get detailed feedback on your technique."
                badge="Coming Soon"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Link href="/curriculum">
                <FeatureCard
                  icon={<BookOpen className="w-7 h-7" />}
                  title="12-Module Curriculum"
                  description="Learn the complete Underdog cold calling methodology from openers to closing."
                />
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <FeatureCard
                icon={<BarChart3 className="w-7 h-7" />}
                title="Performance Dashboard"
                description="Track your progress across all scoring dimensions and see improvement trends."
                badge="Coming Soon"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <FeatureCard
                icon={<Target className="w-7 h-7" />}
                title="Objection Library"
                description="Access AI-powered responses to common objections based on psychology principles."
              />
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <FeatureCard
                icon={<TrendingUp className="w-7 h-7" />}
                title="Real-time Coaching"
                description="Get instant feedback on talk ratio, filler words, pace, and technique during practice."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <Badge variant="navy" className="mb-6">Ready to Start?</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-navy mb-6 font-[family-name:var(--font-maven-pro)]">
              Join <span className="text-gradient-gold">500+</span> Sales Professionals
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start practicing today and see improvement in your first session.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/practice">
                <Button variant="gold" size="xl">
                  <Phone className="w-5 h-5" />
                  Start Free Practice
                </Button>
              </Link>
              <Link href="/curriculum">
                <Button variant="outline" size="xl">
                  <BookOpen className="w-5 h-5" />
                  View Curriculum
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/underdog-logo.png"
                alt="Underdog Sales"
                width={120}
                height={43}
                className="h-10 w-auto"
              />
            </Link>

            <p className="text-sm text-muted-foreground">
              Powered by{' '}
              <a href="https://qualiasolutions.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                Qualia Solutions
              </a>{' '}
              | Copyright &copy; 2026{' '}
              <span className="font-semibold text-navy">Underdog Sales</span>. All Rights Reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-navy transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-navy transition-colors">
                Terms
              </Link>
              <Link href="mailto:support@underdogsales.com" className="text-sm text-muted-foreground hover:text-navy transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
