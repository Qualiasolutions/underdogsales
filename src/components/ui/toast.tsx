'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  title?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'success', title })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'error', title, duration: 7000 }) // Errors stay longer
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'info', title })
  }, [addToast])

  const warning = useCallback((message: string, title?: string) => {
    addToast({ message, type: 'warning', title })
  }, [addToast])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  const slideDirection = position.includes('right') ? 'right' : position.includes('left') ? 'left' : 'up'

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}

      {/* Toast container */}
      <div
        className={cn(
          'fixed z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none',
          positionClasses[position]
        )}
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
              direction={slideDirection}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
  direction: 'left' | 'right' | 'up'
}

function ToastItem({ toast, onClose, direction }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const iconColors = {
    success: 'text-success',
    error: 'text-error',
    info: 'text-blue-500',
    warning: 'text-warning',
  }

  const borderColors = {
    success: 'border-success/20',
    error: 'border-error/20',
    info: 'border-blue-500/20',
    warning: 'border-warning/20',
  }

  const Icon = icons[toast.type]

  const initialX = direction === 'right' ? 100 : direction === 'left' ? -100 : 0
  const initialY = direction === 'up' ? 20 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: initialX, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'bg-card border rounded-xl shadow-lg p-4 pointer-events-auto',
        borderColors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />

        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-foreground text-sm mb-0.5">{toast.title}</p>
          )}
          <p className="text-sm text-muted-foreground">{toast.message}</p>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Standalone toast function for use outside of React components
let toastHandler: ToastContextValue | null = null

export function setToastHandler(handler: ToastContextValue) {
  toastHandler = handler
}

export const toast = {
  success: (message: string, title?: string) => toastHandler?.success(message, title),
  error: (message: string, title?: string) => toastHandler?.error(message, title),
  info: (message: string, title?: string) => toastHandler?.info(message, title),
  warning: (message: string, title?: string) => toastHandler?.warning(message, title),
}
