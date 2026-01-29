'use client'

import { forwardRef, useId } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'flex min-h-[80px] w-full bg-background text-foreground border transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
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
      textareaSize: {
        sm: 'px-3 py-2 text-sm rounded-lg min-h-[60px]',
        md: 'px-4 py-3 text-sm rounded-xl min-h-[100px]',
        lg: 'px-5 py-4 text-base rounded-xl min-h-[140px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: string
  hint?: string
  label?: string
  maxLength?: number
  showCount?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      textareaSize,
      error,
      hint,
      label,
      id,
      disabled,
      maxLength,
      showCount = false,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    const hasError = !!error
    const effectiveVariant = hasError ? 'error' : variant
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            className={cn(
              textareaVariants({ variant: effectiveVariant, textareaSize }),
              showCount && maxLength && 'pb-8',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
            {...props}
          />

          {showCount && maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-error">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
