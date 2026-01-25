import { getAnalyticsData } from '@/lib/actions/admin'
import { MetricsCards } from '@/components/admin/MetricsCards'

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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600">No analytics data available.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform usage and system health</p>
      </div>

      <MetricsCards
        totalSessions={metrics.totalSessions}
        totalCalls={metrics.totalCalls}
        activeUsers={metrics.activeUsers}
      />

      {/* Placeholder for charts - will be added in Plan 02 */}
      <div className="mt-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
        <p className="text-gray-400">Charts coming in Plan 02</p>
      </div>
    </div>
  )
}
