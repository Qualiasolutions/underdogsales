import type { Metadata } from 'next'
import { CallAnalyzer } from '@/components/analyze/CallAnalyzer'

export const metadata: Metadata = {
  title: 'Call Analysis | Underdog AI Sales Coach',
  description: 'Upload your sales call recordings for AI-powered analysis and coaching feedback',
}

export default function AnalyzePage() {
  return <CallAnalyzer />
}
