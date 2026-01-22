'use client'

import { useRef, useEffect, useState, type ReactNode } from 'react'
import { motion, useInView, useScroll, useTransform, type Variants } from 'motion/react'
import { cn } from '@/lib/utils'

// Fade In Animation
interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  className?: string
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 24,
  className,
}: FadeInProps) => {
  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scroll Reveal Animation
interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  once?: boolean
  className?: string
}

export const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 40,
  once = true,
  className,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionOffset[direction] }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger Children Animation
interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  delayChildren?: number
  className?: string
}

export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className,
}: StaggerContainerProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: [0.25, 0.1, 0.25, 1] },
    },
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

// Blur Fade Animation
interface BlurFadeProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export const BlurFade = ({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: BlurFadeProps) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(10px)' }}
    animate={{ opacity: 1, filter: 'blur(0px)' }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
)

// Scale on Hover
interface ScaleHoverProps {
  children: ReactNode
  scale?: number
  className?: string
}

export const ScaleHover = ({
  children,
  scale = 1.05,
  className,
}: ScaleHoverProps) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className={className}
  >
    {children}
  </motion.div>
)

// Float Animation
interface FloatProps {
  children: ReactNode
  duration?: number
  distance?: number
  className?: string
}

export const Float = ({
  children,
  duration = 3,
  distance = 10,
  className,
}: FloatProps) => (
  <motion.div
    animate={{
      y: [-distance / 2, distance / 2, -distance / 2],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Parallax Scroll
interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export const Parallax = ({
  children,
  speed = 0.5,
  className,
}: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

// Voice Visualizer - Animated bars for voice activity
interface VoiceVisualizerProps {
  active?: boolean
  barCount?: number
  className?: string
}

export const VoiceVisualizer = ({
  active = false,
  barCount = 5,
  className,
}: VoiceVisualizerProps) => (
  <div className={cn('flex items-end justify-center gap-1 h-8', className)}>
    {Array.from({ length: barCount }).map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-gold rounded-full"
        animate={
          active
            ? {
                height: ['20%', '100%', '60%', '80%', '40%', '20%'],
              }
            : { height: '20%' }
        }
        transition={
          active
            ? {
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
      />
    ))}
  </div>
)

// Pulse Ring - For call buttons
interface PulseRingProps {
  children: ReactNode
  active?: boolean
  color?: 'gold' | 'navy' | 'success' | 'error'
  className?: string
}

export const PulseRing = ({
  children,
  active = false,
  color = 'gold',
  className,
}: PulseRingProps) => {
  const colorClasses = {
    gold: 'bg-gold/30',
    navy: 'bg-navy/30',
    success: 'bg-success/30',
    error: 'bg-error/30',
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      {active && (
        <>
          <motion.div
            className={cn('absolute inset-0 rounded-full', colorClasses[color])}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className={cn('absolute inset-0 rounded-full', colorClasses[color])}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
        </>
      )}
      {children}
    </div>
  )
}

// Number Counter Animation
interface CounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export const Counter = ({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CounterProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const startValue = 0
    const endValue = value

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [isInView, value, duration])

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString()

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  )
}

// Glow Effect Wrapper
interface GlowProps {
  children: ReactNode
  color?: 'gold' | 'navy'
  className?: string
}

export const Glow = ({
  children,
  color = 'gold',
  className,
}: GlowProps) => (
  <div className={cn('relative', className)}>
    <div
      className={cn(
        'absolute -inset-4 rounded-3xl opacity-30 blur-2xl',
        color === 'gold' && 'bg-gold',
        color === 'navy' && 'bg-navy'
      )}
    />
    <div className="relative">{children}</div>
  </div>
)

// Skeleton Loader with Shimmer
interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Skeleton = ({
  className,
  rounded = 'lg',
}: SkeletonProps) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'skeleton',
        roundedClasses[rounded],
        className
      )}
    />
  )
}

// Spotlight Effect - follows cursor
interface SpotlightProps {
  children: ReactNode
  className?: string
  size?: number
}

export const Spotlight = ({
  children,
  className,
  size = 400,
}: SpotlightProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn('relative overflow-hidden', className)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-10"
        animate={{
          background: isHovering
            ? `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, rgba(231, 178, 33, 0.06), transparent 60%)`
            : 'none',
        }}
        transition={{ duration: 0.15 }}
      />
      {children}
    </div>
  )
}

// Text Shimmer - Animated gradient text
interface TextShimmerProps {
  children: ReactNode
  className?: string
}

export const TextShimmer = ({
  children,
  className,
}: TextShimmerProps) => (
  <motion.span
    className={cn(
      'bg-clip-text text-transparent bg-gradient-to-r from-gold via-gold-light to-gold bg-[length:200%_auto]',
      className
    )}
    animate={{
      backgroundPosition: ['0% center', '200% center'],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    {children}
  </motion.span>
)

// Hover Card - Subtle tilt effect on hover
interface HoverTiltProps {
  children: ReactNode
  className?: string
  tiltAmount?: number
}

export const HoverTilt = ({
  children,
  className,
  tiltAmount = 5,
}: HoverTiltProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    setRotateX((-mouseY / (rect.height / 2)) * tiltAmount)
    setRotateY((mouseX / (rect.width / 2)) * tiltAmount)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
