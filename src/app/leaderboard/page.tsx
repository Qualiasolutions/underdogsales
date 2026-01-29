import type { Metadata } from 'next'
import { LeaderboardPage } from './leaderboard-page'

export const metadata: Metadata = {
  title: 'Leaderboard | Underdog AI Sales Coach',
  description: 'See how you stack up against other sales warriors. Compete, improve, dominate.',
}

export default function Page() {
  return <LeaderboardPage />
}
