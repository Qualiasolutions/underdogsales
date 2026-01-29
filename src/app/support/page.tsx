import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageCircle,
  Mail,
  HelpCircle,
  Book,
  Mic,
  BarChart3,
  GraduationCap,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollReveal, FadeIn } from '@/components/ui/motion'

export const metadata: Metadata = {
  title: 'Support | Underdog Sales',
  description: 'Get help with Underdog Sales AI coaching platform. FAQs, contact support, and resources.',
}

const faqs = [
  {
    question: 'How do I start a practice session?',
    answer: 'Go to the Practice page, select an AI persona and scenario type, then click "Start Practice". You\'ll be connected to a voice call with the AI coach. Speak naturally as you would in a real sales call.',
    icon: Mic,
  },
  {
    question: 'How does call analysis work?',
    answer: 'Upload your sales call recordings on the Analyze page. Our AI will transcribe the conversation and provide detailed feedback across 6 key dimensions: rapport building, discovery questions, objection handling, value proposition, closing techniques, and overall communication.',
    icon: BarChart3,
  },
  {
    question: 'What is the Curriculum section?',
    answer: 'The Curriculum contains structured learning modules covering core Underdog Sales methodology. Complete lessons, watch videos, and track your progress as you master each concept.',
    icon: GraduationCap,
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use enterprise-grade security including encryption at rest and in transit, row-level security policies, and strict access controls. Voice recordings are processed securely and you can delete them anytime.',
    icon: Shield,
  },
  {
    question: 'How often can I practice?',
    answer: 'There are no limits on practice sessions for subscribers. Practice as often as you like to refine your skills. We recommend at least 2-3 sessions per week for optimal improvement.',
    icon: Clock,
  },
  {
    question: 'Can I use this on mobile?',
    answer: 'Yes! Underdog Sales is fully responsive and works on mobile browsers. For the best voice practice experience, we recommend using headphones with a good microphone.',
    icon: MessageCircle,
  },
]

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of using Underdog Sales',
    href: '/curriculum',
    icon: Book,
  },
  {
    title: 'Practice Sessions',
    description: 'Start improving your sales skills now',
    href: '/practice',
    icon: Mic,
  },
  {
    title: 'Chat with Coach',
    description: 'Get instant answers to sales questions',
    href: '/chat',
    icon: MessageCircle,
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                How Can We Help?
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions or reach out to our team for personalized support.
              </p>
            </div>
          </ScrollReveal>

          {/* Contact Cards */}
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <Card variant="highlight" className="group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                      <Mail className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
                      <p className="text-muted-foreground mb-4">
                        Get help from our team. We typically respond within 24 hours on business days.
                      </p>
                      <a
                        href="mailto:support@underdogsales.com"
                        className="inline-flex items-center gap-2 text-gold font-medium hover:underline"
                      >
                        support@underdogsales.com
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="highlight" className="group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                      <MessageCircle className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">AI Sales Coach</h3>
                      <p className="text-muted-foreground mb-4">
                        Have a sales question? Chat with our AI coach for instant guidance and tips.
                      </p>
                      <Link
                        href="/chat"
                        className="inline-flex items-center gap-2 text-gold font-medium hover:underline"
                      >
                        Start a conversation
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>

          {/* FAQs */}
          <ScrollReveal delay={0.2}>
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="grid gap-4">
                {faqs.map((faq, index) => (
                  <FadeIn key={index} delay={0.05 * index}>
                    <Card variant="bordered" className="hover:border-gold/30 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0">
                            <faq.icon className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {faq.question}
                            </h3>
                            <p className="text-foreground/70 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Resources */}
          <ScrollReveal delay={0.3}>
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Helpful Resources
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                  <FadeIn key={index} delay={0.1 * index}>
                    <Link href={resource.href}>
                      <Card variant="interactive" hover className="h-full">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-4">
                            <resource.icon className="w-6 h-6 text-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {resource.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {resource.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Still Need Help */}
          <ScrollReveal delay={0.4}>
            <Card variant="gradient" className="text-center">
              <CardContent className="py-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Still Need Help?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help you
                  get the most out of Underdog Sales.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:support@underdogsales.com">
                    <Button variant="primary" size="lg">
                      <Mail className="w-5 h-5" />
                      Contact Support
                    </Button>
                  </a>
                  <Link href="/chat">
                    <Button variant="outline" size="lg">
                      <MessageCircle className="w-5 h-5" />
                      Ask AI Coach
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/underdog-logo.png"
              alt="Underdog Sales"
              width={100}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
