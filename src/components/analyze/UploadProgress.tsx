'use client'

import { motion } from 'motion/react'
import { Upload, FileText, BarChart3, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CallUploadStatus } from '@/types'

interface UploadProgressProps {
  status: CallUploadStatus | 'uploading'
  error?: string | null
}

const STEPS = [
  { id: 'uploading', label: 'Upload', icon: Upload },
  { id: 'transcribing', label: 'Transcribe', icon: FileText },
  { id: 'scoring', label: 'Analyze', icon: BarChart3 },
] as const

type StepId = (typeof STEPS)[number]['id']

function getStepState(
  stepId: StepId,
  currentStatus: CallUploadStatus | 'uploading'
): 'pending' | 'active' | 'completed' {
  const statusOrder: (CallUploadStatus | 'uploading')[] = [
    'pending',
    'uploading',
    'transcribing',
    'scoring',
    'completed',
  ]

  const currentIndex = statusOrder.indexOf(currentStatus)
  const stepIndex = statusOrder.indexOf(
    stepId === 'uploading' ? 'uploading' : stepId
  )

  if (currentStatus === 'failed') {
    return stepIndex < currentIndex ? 'completed' : 'pending'
  }

  if (currentStatus === 'completed') {
    return 'completed'
  }

  if (stepIndex < currentIndex) {
    return 'completed'
  }
  if (stepIndex === currentIndex) {
    return 'active'
  }
  return 'pending'
}

export function UploadProgress({ status, error }: UploadProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const state = getStepState(step.id, status)
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    state === 'pending' && 'bg-muted text-muted-foreground',
                    state === 'active' && 'bg-gold/20 text-gold',
                    state === 'completed' && 'bg-emerald-100 text-emerald-600'
                  )}
                  animate={
                    state === 'active'
                      ? { scale: [1, 1.05, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: state === 'active' ? Infinity : 0,
                  }}
                >
                  {state === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : state === 'active' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-sm mt-2 font-medium',
                    state === 'pending' && 'text-muted-foreground',
                    state === 'active' && 'text-gold',
                    state === 'completed' && 'text-emerald-600'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold to-emerald-400"
                    initial={{ width: '0%' }}
                    animate={{
                      width: state === 'completed' ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Status message */}
      <div className="text-center">
        {status === 'uploading' && (
          <p className="text-sm text-muted-foreground">
            Uploading your call recording...
          </p>
        )}
        {status === 'transcribing' && (
          <p className="text-sm text-muted-foreground">
            Transcribing audio with AI...
          </p>
        )}
        {status === 'scoring' && (
          <p className="text-sm text-muted-foreground">
            Analyzing your sales techniques...
          </p>
        )}
        {status === 'completed' && (
          <p className="text-sm text-emerald-600 font-medium">
            Analysis complete!
          </p>
        )}
        {status === 'failed' && error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
