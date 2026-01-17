import type { Metadata } from 'next'
import { AnalysisResults } from '@/components/analyze/AnalysisResults'

interface PageProps {
  params: Promise<{ callId: string }>
}

export const metadata: Metadata = {
  title: 'Analysis Results | Underdog AI Sales Coach',
  description: 'View detailed analysis and feedback for your sales call',
}

export default async function AnalysisResultsPage({ params }: PageProps) {
  const { callId } = await params
  return <AnalysisResults callId={callId} />
}
