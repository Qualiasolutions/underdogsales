import { UserRow } from './UserRow'
import type { AdminUser } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'

interface UserTableProps {
  users: AdminUser[]
  className?: string
}

export function UserTable({ users, className }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className={cn('p-12 text-center', className)}>
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              User
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Sessions
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Avg Score
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Last Active
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Joined
            </th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
