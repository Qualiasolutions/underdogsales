'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, FileAudio, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  onRemove: () => void
  file: File | null
  isUploading: boolean
  progress: number
  maxSizeMB?: number
  disabled?: boolean
}

const ACCEPTED_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
]

const ACCEPTED_EXTENSIONS = '.mp3,.wav,.m4a,.webm,.ogg'

export function UploadZone({
  onFileSelect,
  onRemove,
  file,
  isUploading,
  progress,
  maxSizeMB = 100,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (f: File): string | null => {
      if (!ACCEPTED_FORMATS.includes(f.type)) {
        return 'Invalid file type. Please upload MP3, WAV, M4A, WebM, or OGG.'
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        return `File too large. Maximum size is ${maxSizeMB}MB.`
      }
      return null
    },
    [maxSizeMB]
  )

  const handleFile = useCallback(
    (f: File) => {
      const validationError = validateFile(f)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)
      onFileSelect(f)
    },
    [validateFile, onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || isUploading) return

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [disabled, isUploading, handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFile(selectedFile)
      }
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && !file) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading, file])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <motion.div
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
          isDragging && 'border-gold bg-gold/5 scale-[1.02]',
          file && !isUploading && 'border-solid border-emerald-500 bg-emerald-50/50',
          isUploading && 'border-gold/50 bg-gold/5 cursor-not-allowed',
          !file && !isDragging && 'border-border hover:border-navy/30 hover:bg-muted/30',
          (disabled || isUploading) && 'opacity-60 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={!disabled && !isUploading && !file ? { scale: 1.01 } : {}}
        whileTap={!disabled && !isUploading && !file ? { scale: 0.99 } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Empty state */}
        {!file && !isUploading && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gold" />
            </div>
            <div>
              <p className="text-lg font-semibold text-navy">
                Drop your call recording here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports MP3, WAV, M4A, WebM, OGG (max {maxSizeMB}MB)
            </p>
          </div>
        )}

        {/* File selected state */}
        {file && !isUploading && (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FileAudio className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-navy truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="flex-shrink-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Uploading state */}
        {isUploading && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold text-navy">Uploading...</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(progress)}%
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-gold-light"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
