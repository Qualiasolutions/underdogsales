import Link from 'next/link'
import { Users, FileText, TrendingUp, ChevronRight, type LucideIcon } from 'lucide-react'
import { getAllUsers } from '@/lib/actions/admin'
import { getAllPersonas } from '@/config/personas'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-gold/10 rounded-lg">
          <Icon className="w-6 h-6 text-gold" />
        </div>
      </div>
    </div>
  )
}

interface QuickLinkCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

function QuickLinkCard({ title, description, href, icon: Icon }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-card rounded-xl p-6 shadow-sm border',
        'hover:border-gold hover:shadow-md transition-all',
        'flex items-center justify-between group'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-navy/5 rounded-lg group-hover:bg-gold/10 transition-colors">
          <Icon className="w-6 h-6 text-foreground group-hover:text-gold transition-colors" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
    </Link>
  )
}

export default async function AdminDashboard() {
  // Fetch users for count (limit 100 for dashboard overview)
  // For accurate count, we'd need a dedicated count action
  const { users } = await getAllUsers({ limit: 100 })
  const userCount = users.length

  // Get persona count
  const personas = getAllPersonas()
  const personaCount = personas.length

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={userCount}
          icon={Users}
          subtitle="Registered users"
        />
        <StatCard
          title="Practice Sessions"
          value="--"
          icon={TrendingUp}
          subtitle="Coming in Phase 4"
        />
        <StatCard
          title="AI Personas"
          value={personaCount}
          icon={FileText}
          subtitle="Active personas"
        />
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickLinkCard
          title="User Management"
          description="View and manage all platform users"
          href="/admin/users"
          icon={Users}
        />
        <QuickLinkCard
          title="Content Management"
          description="View personas and scoring rubric"
          href="/admin/content"
          icon={FileText}
        />
      </div>
    </div>
  )
}
