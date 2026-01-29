'use client'

import { useEffect } from 'react'
import { ToastProvider as ToastProviderBase, useToast, setToastHandler } from '@/components/ui/toast'
import type { ReactNode } from 'react'

// Internal component to register the toast handler
function ToastHandlerRegistrar() {
  const toastContext = useToast()

  useEffect(() => {
    setToastHandler(toastContext)
  }, [toastContext])

  return null
}

interface ToastProviderProps {
  children: ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
  return (
    <ToastProviderBase position={position}>
      <ToastHandlerRegistrar />
      {children}
    </ToastProviderBase>
  )
}

// Re-export for convenience
export { useToast, toast } from '@/components/ui/toast'
