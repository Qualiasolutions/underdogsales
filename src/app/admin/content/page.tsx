import Link from 'next/link'
import { Users, Target, type LucideIcon } from 'lucide-react'
import { PERSONAS } from '@/config/personas'
import { SCORING_RUBRIC } from '@/config/rubric'

interface ContentCardProps {
  title: string
  description: string
  count: number
  countLabel: string
  href: string
  icon: LucideIcon
}

function ContentCard({ title, description, count, countLabel, href, icon: Icon }: ContentCardProps) {
  return (
    <Link
      href={href}
      className="block bg-card rounded-xl border shadow-sm p-6 hover:shadow-md hover:border-navy/20 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-navy/5 rounded-lg">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <p className="text-sm font-medium text-foreground mt-3">
            {count} {countLabel}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function ContentManagementPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Content Management</h1>
      <p className="text-muted-foreground mb-8">
        View platform content configuration. Content is currently read-only.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContentCard
          title="AI Personas"
          description="Practice conversation partners with unique personalities"
          count={Object.keys(PERSONAS).length}
          countLabel="personas"
          href="/admin/content/personas"
          icon={Users}
        />
        <ContentCard
          title="Scoring Rubric"
          description="Evaluation criteria for sales call performance"
          count={SCORING_RUBRIC.length}
          countLabel="dimensions"
          href="/admin/content/rubric"
          icon={Target}
        />
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Content is defined in configuration files and displayed here for reference.
          To modify content, update the source files in <code className="bg-amber-100 px-1 rounded">src/config/</code>.
        </p>
      </div>
    </div>
  )
}
