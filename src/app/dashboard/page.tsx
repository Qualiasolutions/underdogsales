import { getUserPracticeSessions } from '@/lib/actions/practice-session'
import { getUserCallUploads } from '@/lib/actions/call-analysis'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const metadata = {
  title: 'Dashboard | Underdog Sales',
  description: 'View your practice history and progress',
}

export default async function DashboardPage() {
  const [sessionsResult, callsResult] = await Promise.all([
    getUserPracticeSessions({ limit: 10, offset: 0 }),
    getUserCallUploads({ limit: 10, offset: 0 }),
  ])

  return (
    <DashboardClient
      initialSessions={sessionsResult.sessions}
      initialSessionsHasMore={sessionsResult.hasMore}
      initialCalls={callsResult.uploads}
      initialCallsHasMore={callsResult.hasMore}
    />
  )
}
