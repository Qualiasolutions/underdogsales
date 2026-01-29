'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  BookOpen,
  Mic,
  MessageSquare,
  LayoutDashboard,
  Settings,
  Trophy,
  Headphones,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/components/providers/auth-provider'

interface HeaderProps {
  variant?: 'default' | 'transparent'
  showNav?: boolean
}

// Nav links for logged-in users (no Home link - they're already in the app)
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/practice', label: 'Practice', icon: Mic },
  { href: '/create', label: 'Create', icon: Sparkles },
  { href: '/coach', label: 'Coach', icon: Headphones },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
]

export function Header({ variant = 'default', showNav = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b transition-colors',
        variant === 'transparent'
          ? 'bg-background/80 backdrop-blur-md border-border/50'
          : 'bg-background border-border'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/underdog-logo.png"
              alt="Underdog Sales"
              width={120}
              height={43}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation - only show when logged in */}
          {showNav && user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right side - Theme Toggle & Auth */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Auth */}
            {!loading && (
              <div className="hidden sm:block">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {user.email?.[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground max-w-[120px] truncate hidden lg:block">
                        {user.email?.split('@')[0]}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          profileMenuOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {profileMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setProfileMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden"
                          >
                            <div className="p-3 border-b border-border">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Signed in
                              </p>
                            </div>
                            <div className="p-2 space-y-1">
                              <Link
                                href="/settings"
                                onClick={() => setProfileMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                                Settings
                              </Link>
                              <button
                                onClick={() => {
                                  setProfileMenuOpen(false)
                                  signOut()
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error/5 transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Mobile menu button - only show when logged in */}
            {user && (
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            )}

            {/* Mobile sign in button when logged out */}
            {!loading && !user && (
              <Link href="/login" className="sm:hidden">
                <Button variant="primary" size="sm">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - only show when logged in */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Navigation links */}
              {showNav &&
                navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive(link.href)
                          ? 'bg-primary/10 text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  )
                })}

              {/* Mobile auth */}
              <div className="pt-4 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-error hover:bg-error/5"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
