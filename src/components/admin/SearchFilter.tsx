'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect, useCallback } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  defaultSearch?: string
  placeholder?: string
  className?: string
}

export function SearchFilter({
  defaultSearch = '',
  placeholder = 'Search...',
  className,
}: SearchFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(defaultSearch)
  const debouncedSearch = useDebounce(searchValue, 300)

  // Update URL when debounced search changes
  const updateSearch = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (value.trim()) {
          params.set('search', value.trim())
        } else {
          params.delete('search')
        }

        // Reset to page 1 when search changes
        params.delete('page')

        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  // Trigger search when debounced value changes
  useEffect(() => {
    // Only update if the value actually changed from the URL param
    const currentSearch = searchParams.get('search') || ''
    if (debouncedSearch !== currentSearch) {
      updateSearch(debouncedSearch)
    }
  }, [debouncedSearch, searchParams, updateSearch])

  // Sync with URL on mount/navigation
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchValue) {
      setSearchValue(urlSearch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleClear = () => {
    setSearchValue('')
  }

  return (
    <div className={cn('relative mb-6', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-lg border',
            'bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold',
            'placeholder:text-muted-foreground'
          )}
        />
        {isPending ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
        ) : searchValue ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
