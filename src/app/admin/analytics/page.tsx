import { getAnalyticsData } from '@/lib/actions/admin'
import { MetricsCards } from '@/components/admin/MetricsCards'
import { UsageCharts } from '@/components/admin/UsageCharts'
import { SystemHealth } from '@/components/admin/SystemHealth'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const { metrics, error } = await getAnalyticsData()

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-800">Error Loading Analytics</h2>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-muted border border-border rounded-xl p-6">
        <p className="text-gray-600">No analytics data available.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform usage and system health</p>
      </div>

      <MetricsCards
        totalSessions={metrics.totalSessions}
        totalCalls={metrics.totalCalls}
        activeUsers={metrics.activeUsers}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <UsageCharts data={metrics.dailyData} />
        </div>
        <div>
          <SystemHealth />
        </div>
      </div>
    </div>
  )
}
