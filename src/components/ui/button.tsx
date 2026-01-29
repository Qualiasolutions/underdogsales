'use client'

import { forwardRef, useState, useRef } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-gold text-navy hover:bg-gold-dark shadow-md hover:shadow-gold',
        secondary:
          'bg-navy text-white hover:bg-navy-light shadow-md hover:shadow-navy',
        outline:
          'border-2 border-navy text-navy bg-transparent hover:bg-navy hover:text-white',
        ghost:
          'text-navy hover:bg-navy/5',
        gold:
          'bg-gradient-to-r from-gold to-gold-light text-navy font-bold shadow-gold hover:shadow-gold-intense',
        navy:
          'bg-gradient-to-r from-navy to-navy-light text-white font-bold shadow-navy',
        success:
          'bg-success text-white hover:bg-success/90 shadow-md',
        danger:
          'bg-error text-white hover:bg-error/90 shadow-md',
        link:
          'text-navy underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-xs rounded-lg',
        md: 'h-11 px-6 text-sm rounded-xl',
        lg: 'h-14 px-8 text-base rounded-xl',
        xl: 'h-16 px-10 text-lg rounded-2xl',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
        'icon-lg': 'h-14 w-14 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  shine?: boolean
  magnetic?: boolean
  ripple?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, shine, magnetic, ripple, children, disabled, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || disabled || !buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * 0.2
      const deltaY = (e.clientY - centerY) * 0.2
      setMagneticOffset({ x: deltaX, y: deltaY })
    }

    const handleMouseLeave = () => {
      if (magnetic) {
        setMagneticOffset({ x: 0, y: 0 })
      }
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()
        setRipples((prev) => [...prev, { x, y, id }])
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id))
        }, 600)
      }
      props.onClick?.(e)
    }

    return (
      <motion.button
        ref={(node) => {
          // Handle both refs
          buttonRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(
          buttonVariants({ variant, size }),
          shine && 'shine',
          ripple && 'overflow-hidden relative',
          className
        )}
        disabled={disabled || loading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={magnetic ? { x: magneticOffset.x, y: magneticOffset.y } : undefined}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.length > 0 && ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: r.x,
              top: r.y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="opacity-70">Loading...</span>
          </>
        ) : (
          children as React.ReactNode
        )}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export { Button, buttonVariants }
