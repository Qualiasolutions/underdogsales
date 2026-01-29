'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  hasMore: boolean
  className?: string
}

export function Pagination({ currentPage, hasMore, className }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }

  const isFirstPage = currentPage <= 1
  const isLastPage = !hasMore

  return (
    <div className={cn('flex items-center justify-between mt-6', className)}>
      <div className="text-sm text-muted-foreground">
        Page {currentPage}
      </div>

      <div className="flex items-center gap-2">
        {isFirstPage ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-4 py-2 rounded-lg',
              'text-muted-foreground bg-gray-100 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </span>
        ) : (
          <Link
            href={createPageUrl(currentPage - 1)}
            className={cn(
              'inline-flex items-center gap-1 px-4 py-2 rounded-lg',
              'bg-card border hover:bg-muted transition-colors'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
        )}

        {isLastPage ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-4 py-2 rounded-lg',
              'text-muted-foreground bg-gray-100 cursor-not-allowed'
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        ) : (
          <Link
            href={createPageUrl(currentPage + 1)}
            className={cn(
              'inline-flex items-center gap-1 px-4 py-2 rounded-lg',
              'bg-card border hover:bg-muted transition-colors'
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
