'use client'

import React, { useEffect, useState } from 'react'

// No scroll effects - completely removed
export default function ScrollEffects() {
  return null
}

// Mouse-responsive depth layers (no scroll dependency)
export function DepthLayers() {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMouseX(x)
      setMouseY(y)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-25 overflow-hidden pointer-events-none">
      {/* Background layer that follows mouse subtly */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.015] transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`,
          backgroundImage: `
            radial-gradient(ellipse at 40% 40%, rgb(150, 150, 150) 0%, transparent 60%),
            radial-gradient(ellipse at 60% 60%, rgb(130, 130, 130) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Mid layer */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02] transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mouseX * 0.3}px, ${mouseY * 0.3}px)`,
          backgroundImage: `
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgb(170, 170, 170) 1deg,
              transparent 2deg,
              transparent 90deg
            )
          `,
          backgroundSize: '300px 300px'
        }}
      />
      
      {/* Front layer */}
      <div 
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.01] transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mouseX * 0.1}px, ${mouseY * 0.1}px)`,
          backgroundImage: `
            linear-gradient(135deg, transparent 25%, rgb(190, 190, 190) 25.5%, rgb(190, 190, 190) 26%, transparent 26.5%),
            linear-gradient(45deg, transparent 25%, rgb(190, 190, 190) 25.5%, rgb(190, 190, 190) 26%, transparent 26.5%)
          `,
          backgroundSize: '200px 200px'
        }}
      />
    </div>
  )
}

// Ambient lighting effect (time-based, no scroll)
export function AmbientLighting() {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1)
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 -z-35 overflow-hidden pointer-events-none">
      {/* Breathing light effect */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: `radial-gradient(ellipse at center, rgb(140, 140, 140) 0%, transparent 70%)`,
          opacity: 0.01 + Math.sin(time * 0.02) * 0.008,
          transform: `scale(${1 + Math.sin(time * 0.015) * 0.1})`
        }}
      />
      
      {/* Subtle color shift */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 70%, rgba(160, 160, 160, ${0.005 + Math.cos(time * 0.01) * 0.003}) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(120, 120, 120, ${0.008 + Math.sin(time * 0.008) * 0.004}) 0%, transparent 60%)
          `
        }}
      />

      {/* Static floating ambient particles */}
      <div 
        className="absolute w-2 h-2 bg-gray-300/20 dark:bg-white/10 rounded-full"
        style={{
          top: '30%',
          left: '20%',
          animation: 'ambientFloat1 60s ease-in-out infinite'
        }}
      />

      <div 
        className="absolute w-1 h-1 bg-gray-400/25 dark:bg-white/8 rounded-full"
        style={{
          top: '70%',
          right: '25%',
          animation: 'ambientFloat2 45s ease-in-out infinite reverse'
        }}
      />

      <div 
        className="absolute w-3 h-3 bg-gray-300/15 dark:bg-white/6 rounded-full"
        style={{
          top: '50%',
          left: '80%',
          animation: 'ambientFloat3 55s ease-in-out infinite'
        }}
      />

      <style jsx>{`
        @keyframes ambientFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(30px, -20px) scale(1.2) rotate(90deg); }
          50% { transform: translate(-20px, 30px) scale(0.8) rotate(180deg); }
          75% { transform: translate(25px, -15px) scale(1.1) rotate(270deg); }
        }
        
        @keyframes ambientFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-25px, 20px) scale(1.3) rotate(180deg); }
        }
        
        @keyframes ambientFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(15px, -25px) scale(0.7) rotate(120deg); }
          66% { transform: translate(-15px, 25px) scale(1.4) rotate(240deg); }
        }
      `}</style>
    </div>
  )
} 