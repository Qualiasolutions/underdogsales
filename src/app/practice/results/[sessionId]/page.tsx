import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPracticeSession } from '@/lib/actions/practice-session'
import { getPersonaById } from '@/config/personas'
import { PracticeResults } from './practice-results'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sessionId } = await params
  const session = await getPracticeSession(sessionId)

  if (!session) {
    return { title: 'Session Not Found | Underdog AI Sales Coach' }
  }

  const persona = getPersonaById(session.persona_id)
  return {
    title: `Results: ${persona?.name || 'Practice'} | Underdog AI Sales Coach`,
    description: `Your practice session score: ${session.overall_score}/10`,
  }
}

export default async function PracticeResultsPage({ params }: PageProps) {
  const { sessionId } = await params
  const session = await getPracticeSession(sessionId)

  if (!session) {
    notFound()
  }

  const persona = getPersonaById(session.persona_id)

  return (
    <PracticeResults
      session={session}
      personaName={persona?.name || 'AI Prospect'}
      personaRole={persona?.role || 'Unknown'}
    />
  )
}
