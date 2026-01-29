'use client'

import Link from 'next/link'
import type { AdminUser } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface UserRowProps {
  user: AdminUser
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getScoreColorClass(score: number): string {
  if (score >= 7) return 'text-green-600 bg-green-50'
  if (score >= 5) return 'text-yellow-600 bg-yellow-50'
  if (score > 0) return 'text-red-600 bg-red-50'
  return 'text-muted-foreground bg-muted'
}

export function UserRow({ user }: UserRowProps) {
  return (
    <Link
      href={`/admin/users/${user.id}`}
      className={cn(
        'table-row',
        'hover:bg-muted transition-colors cursor-pointer',
        'group'
      )}
    >
      <td className="px-4 py-4">
        <div className="font-medium text-foreground">{user.name || 'No name'}</div>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {user.email}
      </td>
      <td className="px-4 py-4 text-center">
        <span className="font-medium">{user.session_count}</span>
      </td>
      <td className="px-4 py-4 text-center">
        {user.average_score > 0 ? (
          <span
            className={cn(
              'inline-flex px-2 py-1 rounded text-sm font-medium',
              getScoreColorClass(user.average_score)
            )}
          >
            {user.average_score.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground">--</span>
        )}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {formatDate(user.last_active)}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {formatDate(user.created_at)}
      </td>
      <td className="px-4 py-4">
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
      </td>
    </Link>
  )
}
