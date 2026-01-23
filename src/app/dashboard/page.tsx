import { getUserPracticeSessions } from '@/lib/actions/practice-session'
import { getUserCallUploads } from '@/lib/actions/call-analysis'
import { getScoreTrends, getDimensionAverages } from '@/lib/actions/progress'
import { getCurriculumProgress } from '@/lib/actions/curriculum'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard | Underdog Sales',
  description: 'View your practice history and progress',
}

export default async function DashboardPage() {
  const [sessionsResult, callsResult, scoreTrends, dimensionAverages, curriculumProgress] =
    await Promise.all([
      getUserPracticeSessions({ limit: 10, offset: 0 }),
      getUserCallUploads({ limit: 10, offset: 0 }),
      getScoreTrends(20),
      getDimensionAverages(),
      getCurriculumProgress(),
    ])

  return (
    <DashboardClient
      initialSessions={sessionsResult.sessions}
      initialSessionsHasMore={sessionsResult.hasMore}
      initialCalls={callsResult.uploads}
      initialCallsHasMore={callsResult.hasMore}
      initialScoreTrends={scoreTrends}
      initialDimensionAverages={dimensionAverages}
      initialCurriculumProgress={curriculumProgress}
    />
  )
}
