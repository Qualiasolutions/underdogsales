import { getAllUsers } from '@/lib/actions/admin'
import { UserTable } from '@/components/admin/UserTable'
import { SearchFilter } from '@/components/admin/SearchFilter'
import { Pagination } from '@/components/admin/Pagination'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams
  const search = params.search || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const { users, hasMore, error } = await getAllUsers({
    search,
    limit: PAGE_SIZE,
    offset,
  })

  // Calculate approximate total for display
  // Since we don't have a count query, we show relative info
  const showingCount = users.length
  const fromIndex = offset + 1
  const toIndex = offset + showingCount

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Users</h1>
        {showingCount > 0 && (
          <span className="text-muted-foreground">
            Showing {fromIndex}-{toIndex}
          </span>
        )}
      </div>

      <SearchFilter
        defaultSearch={search}
        placeholder="Search by name or email..."
      />

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <UserTable users={users} />
      </div>

      {(users.length > 0 || page > 1) && (
        <Pagination currentPage={page} hasMore={hasMore} />
      )}
    </div>
  )
}
