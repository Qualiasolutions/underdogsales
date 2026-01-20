import type { Metadata } from 'next'
import { VoicePractice } from '@/components/voice/VoicePractice'

export const metadata: Metadata = {
  title: 'Practice | Underdog AI Sales Coach',
  description: 'Practice cold calling with AI-powered prospect simulations',
}

export default function PracticePage() {
  return <VoicePractice />
}
