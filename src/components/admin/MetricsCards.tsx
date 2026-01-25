import { MessageSquare, Phone, Users } from 'lucide-react'

interface MetricsCardsProps {
  totalSessions: number
  totalCalls: number
  activeUsers: number
}

const formatter = new Intl.NumberFormat('en-US')

interface MetricCardProps {
  icon: React.ReactNode
  iconBg: string
  value: number
  label: string
}

function MetricCard({ icon, iconBg, value, label }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-navy">{formatter.format(value)}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

export function MetricsCards({ totalSessions, totalCalls, activeUsers }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        icon={<MessageSquare className="w-6 h-6 text-navy" />}
        iconBg="bg-navy/10"
        value={totalSessions}
        label="Practice Sessions"
      />
      <MetricCard
        icon={<Phone className="w-6 h-6 text-emerald-600" />}
        iconBg="bg-emerald-100"
        value={totalCalls}
        label="Calls Analyzed"
      />
      <MetricCard
        icon={<Users className="w-6 h-6 text-gold" />}
        iconBg="bg-gold/10"
        value={activeUsers}
        label="Active Users (30 days)"
      />
    </div>
  )
}
