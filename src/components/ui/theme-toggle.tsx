'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

// Use useSyncExternalStore for hydration-safe mounting check
const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!mounted) {
    return (
      <div className={cn('w-9 h-9 rounded-lg bg-muted animate-pulse', className)} />
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative w-9 h-9 rounded-lg flex items-center justify-center',
          'bg-muted hover:bg-muted/80 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          className
        )}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {resolvedTheme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-4 h-4 text-gold" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-4 h-4 text-gold-dark" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    )
  }

  // Dropdown variant
  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-muted hover:bg-muted/80 transition-colors text-sm font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2'
        )}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-gold" />
        ) : (
          <Sun className="w-4 h-4 text-gold-dark" />
        )}
        <span className="text-foreground capitalize">
          {theme === 'system' ? 'System' : theme}
        </span>
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-36 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value)
                    setDropdownOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                    theme === value
                      ? 'bg-gold/10 text-gold-dark'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {theme === value && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
