import React, { useEffect, useRef, useCallback } from 'react'

const PARTICLE_COLORS = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853',
  '#AA47BC', '#00ACC1', '#FF7043', '#43A047',
]

const ConfettiOverlay = ({ prefersReducedMotion }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const particlesRef = useRef([])
  const animFrameRef = useRef(null)
  const isLoopingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resize = () => {
      const r = container.getBoundingClientRect()
      canvas.width = r.width
      canvas.height = r.height
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const animate = () => {
      if (particlesRef.current.length === 0) {
        isLoopingRef.current = false
        return
      }

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)

      for (const p of particlesRef.current) {
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.55)
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -p.size * 0.6)
          ctx.lineTo(p.size * 0.4, 0)
          ctx.lineTo(0, p.size * 0.6)
          ctx.lineTo(-p.size * 0.4, 0)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06
        p.vx *= 0.99
        p.rotation += p.rotSpeed
        p.life -= p.decay
        p.size *= 0.997
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    const startLoop = () => {
      if (!isLoopingRef.current) {
        isLoopingRef.current = true
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }

    window.__restartConfetti = startLoop
    startLoop()

    const idleEmitter = setInterval(() => {
      if (prefersReducedMotion) return
      const w = canvas.width
      const h = canvas.height
      if (w === 0 || h === 0) return
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w
        const y = Math.random() * h * 0.8
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
        const speed = 1.2 + Math.random() * 2.8
        const shapeRng = Math.random()
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          size: 3 + Math.random() * 6,
          life: 0.7 + Math.random() * 0.3,
          decay: 0.012 + Math.random() * 0.018,
          shape: shapeRng < 0.4 ? 'circle' : shapeRng < 0.72 ? 'rect' : 'diamond',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.18,
        })
      }
      if (particlesRef.current.length > 500) particlesRef.current = particlesRef.current.slice(-500)
      startLoop()
    }, 120)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animFrameRef.current)
      clearInterval(idleEmitter)
      delete window.__restartConfetti
    }
  }, [prefersReducedMotion])

  const spawnParticles = (x, y) => {
    if (prefersReducedMotion) return
    const count = 5 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.8 + Math.random() * 3.8
      const shapeRng = Math.random()
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        size: 4 + Math.random() * 7,
        life: 0.85 + Math.random() * 0.15,
        decay: 0.016 + Math.random() * 0.024,
        shape: shapeRng < 0.45 ? 'circle' : shapeRng < 0.75 ? 'rect' : 'diamond',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.22,
      })
    }
    if (particlesRef.current.length > 400) particlesRef.current = particlesRef.current.slice(-400)
    if (window.__restartConfetti) window.__restartConfetti()
  }

  const handlePointerMove = (e) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    spawnParticles(e.clientX - rect.left, e.clientY - rect.top)
  }

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-[2] pointer-events-none"
      onPointerMove={handlePointerMove}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

export default ConfettiOverlay
