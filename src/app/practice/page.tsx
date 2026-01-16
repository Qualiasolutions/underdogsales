import { VoicePractice } from '@/components/voice/VoicePractice'

export const metadata = {
  title: 'Practice | Underdog AI Sales Coach',
  description: 'Practice cold calling with AI-powered prospect simulations',
}

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <VoicePractice />
    </main>
  )
}
