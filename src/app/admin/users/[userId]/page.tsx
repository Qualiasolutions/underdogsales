import { getUserDetail } from '@/lib/actions/admin'
import { UserDetailCard } from '@/components/admin/UserDetailCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params

  const { user, sessions, error } = await getUserDetail(userId)

  if (error || !user) {
    notFound()
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center text-muted-foreground hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Link>

      <UserDetailCard user={user} sessions={sessions} />
    </div>
  )
}
