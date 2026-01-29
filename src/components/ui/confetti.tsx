'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ConfettiConfig {
  particleCount?: number
  spread?: number
  startVelocity?: number
  decay?: number
  gravity?: number
  ticks?: number
  origin?: { x: number; y: number }
  colors?: string[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  shape: 'square' | 'circle'
  size: number
  tick: number
}

const defaultColors = [
  '#E7B221', // gold
  '#F5D56A', // gold-light
  '#021945', // navy
  '#10B981', // success
]

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  const fire = useCallback((config: ConfettiConfig = {}) => {
    const {
      particleCount = 50,
      spread = 60,
      startVelocity = 30,
      decay = 0.94,
      gravity = 1,
      ticks = 200,
      origin = { x: 0.5, y: 0.5 },
      colors = defaultColors,
    } = config

    // Create or get canvas
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas')
      canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `
      document.body.appendChild(canvas)
      canvasRef.current = canvas
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Create particles
    const originX = origin.x * window.innerWidth
    const originY = origin.y * window.innerHeight
    const spreadRad = (spread * Math.PI) / 180

    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad
      const velocity = startVelocity * (0.5 + Math.random() * 0.5)

      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'square' : 'circle',
        size: 6 + Math.random() * 4,
        tick: 0,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      particlesRef.current = particlesRef.current.filter((p) => {
        p.tick++
        if (p.tick > ticks) return false

        // Physics
        p.vy += gravity * 0.1
        p.vx *= decay
        p.vy *= decay
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        // Fade out
        const progress = p.tick / ticks
        const opacity = 1 - progress

        // Draw
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
        return true
      })

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Cleanup
        if (canvasRef.current) {
          document.body.removeChild(canvasRef.current)
          canvasRef.current = null
        }
      }
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    animate()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current)
      }
    }
  }, [])

  return { fire }
}

// Convenience function to fire confetti without hook
export function fireConfetti(config?: ConfettiConfig) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth * window.devicePixelRatio
  canvas.height = window.innerHeight * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const {
    particleCount = 50,
    spread = 60,
    startVelocity = 30,
    decay = 0.94,
    gravity = 1,
    ticks = 200,
    origin = { x: 0.5, y: 0.5 },
    colors = defaultColors,
  } = config || {}

  const particles: Particle[] = []
  const originX = origin.x * window.innerWidth
  const originY = origin.y * window.innerHeight
  const spreadRad = (spread * Math.PI) / 180

  for (let i = 0; i < particleCount; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad
    const velocity = startVelocity * (0.5 + Math.random() * 0.5)

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'square' : 'circle',
      size: 6 + Math.random() * 4,
      tick: 0,
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    const remaining = particles.filter((p) => {
      p.tick++
      if (p.tick > ticks) return false

      p.vy += gravity * 0.1
      p.vx *= decay
      p.vy *= decay
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.rotationSpeed

      const progress = p.tick / ticks
      const opacity = 1 - progress

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color

      if (p.shape === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
      return true
    })

    particles.length = 0
    particles.push(...remaining)

    if (particles.length > 0) {
      requestAnimationFrame(animate)
    } else {
      document.body.removeChild(canvas)
    }
  }

  animate()
}

// Preset: Celebration burst for high scores
export function celebrationBurst() {
  // Fire from multiple origins
  const origins = [
    { x: 0.25, y: 0.6 },
    { x: 0.5, y: 0.5 },
    { x: 0.75, y: 0.6 },
  ]

  origins.forEach((origin, i) => {
    setTimeout(() => {
      fireConfetti({
        particleCount: 30,
        spread: 70,
        origin,
        startVelocity: 35,
      })
    }, i * 100)
  })
}
