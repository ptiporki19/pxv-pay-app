'use client'

import React, { useEffect, useState } from 'react'

export default function BackgroundEffects() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Elegant Grid Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(139, 92, 246) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(139, 92, 246) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'elegantGrid 60s linear infinite'
          }}
        />
      </div>

      {/* Subtle Floating Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Primary elegant orb */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-[0.03] dark:opacity-[0.04] blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-500) 0%, transparent 70%)',
            top: '15%',
            right: '20%',
            animation: 'gentleFloat1 40s ease-in-out infinite'
          }}
        />
        
        {/* Secondary elegant orb */}
        <div 
          className="absolute w-80 h-80 rounded-full opacity-[0.04] dark:opacity-[0.03] blur-2xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-600) 0%, transparent 70%)',
            bottom: '25%',
            left: '10%',
            animation: 'gentleFloat2 50s ease-in-out infinite reverse'
          }}
        />

        {/* Accent orb */}
        <div 
          className="absolute w-64 h-64 rounded-full opacity-[0.02] dark:opacity-[0.03] blur-xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-400) 0%, transparent 70%)',
            top: '50%',
            right: '40%',
            animation: 'gentleFloat3 35s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes elegantGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }
        
        @keyframes gentleFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.05); }
        }
        
        @keyframes gentleFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 20px) scale(0.95); }
        }
        
        @keyframes gentleFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -10px) scale(1.02); }
          66% { transform: translate(-10px, 10px) scale(0.98); }
        }
      `}</style>
    </>
  )
}

// Professional Payment Elements
export function PaymentShapes() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Elegant card outline */}
      <div 
        className="absolute w-20 h-12 rounded-xl border border-violet-200 dark:border-violet-800 opacity-20 dark:opacity-15"
        style={{
          top: '20%',
          left: '15%',
          animation: 'cardGentleFloat 45s ease-in-out infinite'
        }}
      />
      
      {/* Minimalist currency symbol */}
      <div 
        className="absolute text-4xl font-light opacity-[0.04] dark:opacity-[0.03] select-none text-violet-500"
        style={{
          top: '65%',
          right: '25%',
          animation: 'symbolGentle 60s ease-in-out infinite'
        }}
      >
        $
      </div>
      
      {/* Elegant payment flow line */}
      <svg 
        className="absolute w-48 h-24 opacity-[0.06] dark:opacity-[0.04] text-violet-400"
        style={{
          top: '35%',
          left: '60%',
          animation: 'pathGentle 50s ease-in-out infinite'
        }}
        viewBox="0 0 150 75"
      >
        <path 
          d="M 15 37.5 Q 45 15 75 37.5 T 135 37.5" 
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none"
          strokeDasharray="4 8"
        />
      </svg>

      <style jsx>{`
        @keyframes cardGentleFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(8px, -5px) rotate(1deg); }
        }
        
        @keyframes symbolGentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        
        @keyframes pathGentle {
          0%, 100% { stroke-dashoffset: 0; opacity: 0.06; }
          50% { stroke-dashoffset: 12; opacity: 0.08; }
        }
      `}</style>
    </div>
  )
}

// Minimal Particle Field
export function ParticleField() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 15
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'var(--violet-500)',
            opacity: 0.08,
            animation: `gentleParticle ${25 + particle.delay}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes gentleParticle {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.08;
          }
          50% { 
            transform: translate(15px, -20px) scale(1.1);
            opacity: 0.12;
          }
        }
      `}</style>
    </div>
  )
}

// Sophisticated Gradient Overlay
export function GradientOverlay() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      {/* Professional violet gradients */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-[0.015] dark:opacity-[0.02]"
        style={{
          background: `
            radial-gradient(ellipse at 25% 25%, var(--violet-500) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 75%, var(--violet-600) 0%, transparent 60%)
          `
        }}
      />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.008] dark:opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0.5 0 0.1 0 0 0.5 0 0.05 0 0 0.5 0 0.2 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}
      />
    </div>
  )
}

// Refined Geometric Accents
export function GeometricAccents() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Elegant lines */}
      <div 
        className="absolute w-1 h-24 rounded-full"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--violet-500), transparent)',
          opacity: 0.1,
          top: '30%',
          right: '20%',
          transform: 'rotate(15deg)',
          animation: 'lineGentle1 55s ease-in-out infinite'
        }}
      />
      
      <div 
        className="absolute w-1 h-32 rounded-full"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--violet-600), transparent)',
          opacity: 0.08,
          bottom: '35%',
          left: '25%',
          transform: 'rotate(-10deg)',
          animation: 'lineGentle2 45s ease-in-out infinite reverse'
        }}
      />
      
      {/* Minimal circles */}
      <div 
        className="absolute w-6 h-6 rounded-full"
        style={{
          border: '1px solid var(--violet-500)',
          opacity: 0.15,
          top: '45%',
          right: '15%',
          animation: 'circleGentle 40s ease-in-out infinite'
        }}
      />

      <style jsx>{`
        @keyframes lineGentle1 {
          0%, 100% { transform: rotate(15deg) translateY(0); opacity: 0.1; }
          50% { transform: rotate(18deg) translateY(-10px); opacity: 0.15; }
        }
        
        @keyframes lineGentle2 {
          0%, 100% { transform: rotate(-10deg) translateY(0); opacity: 0.08; }
          50% { transform: rotate(-12deg) translateY(8px); opacity: 0.12; }
        }

        @keyframes circleGentle {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.2; }
        }
      `}</style>
    </div>
  )
} 