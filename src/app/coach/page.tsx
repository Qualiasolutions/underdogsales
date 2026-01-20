import type { Metadata } from 'next'
import { VoiceCoach } from '@/components/voice/VoiceCoach'

export const metadata: Metadata = {
  title: 'Coach Giulio | Underdog AI Sales Coach',
  description: 'Learn cold calling with Giulio Segantini - The Weirdest Sales Trainer. Master the 12-module Underdog methodology with real-time AI coaching.',
}

export default function CoachPage() {
  return <VoiceCoach />
}
