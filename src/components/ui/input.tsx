'use client'

import { forwardRef, useId, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full bg-background text-foreground border transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-border hover:border-gold/50 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20',
        filled:
          'bg-muted border-transparent hover:bg-muted/70 focus-visible:bg-background focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20',
        ghost:
          'border-transparent hover:bg-muted focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-gold/20',
        error:
          'border-error hover:border-error focus-visible:border-error focus-visible:ring-2 focus-visible:ring-error/20',
        success:
          'border-success hover:border-success focus-visible:border-success focus-visible:ring-2 focus-visible:ring-success/20',
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-4 text-sm rounded-xl',
        lg: 'h-14 px-5 text-base rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
  hint?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type = 'text',
      leftIcon,
      rightIcon,
      error,
      hint,
      label,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const hasError = !!error
    const effectiveVariant = hasError ? 'error' : variant

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              inputVariants({ variant: effectiveVariant, inputSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
