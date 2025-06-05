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
      {/* Animated Grid Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(100, 100, 100) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(100, 100, 100) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large violet orb */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-[0.06] dark:opacity-[0.08] blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-500) 0%, var(--violet-400) 30%, transparent 70%)',
            top: '10%',
            right: '10%',
            animation: 'float1 25s ease-in-out infinite'
          }}
        />
        
        {/* Medium violet orb */}
        <div 
          className="absolute w-64 h-64 rounded-full opacity-[0.08] dark:opacity-[0.06] blur-2xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-600) 0%, var(--violet-500) 30%, transparent 70%)',
            bottom: '20%',
            left: '15%',
            animation: 'float2 30s ease-in-out infinite reverse'
          }}
        />

        {/* Small violet accent orb */}
        <div 
          className="absolute w-32 h-32 rounded-full opacity-[0.1] dark:opacity-[0.07] blur-xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-400) 0%, var(--violet-300) 30%, transparent 70%)',
            top: '60%',
            right: '30%',
            animation: 'float3 20s ease-in-out infinite'
          }}
        />

        {/* Additional floating violet orbs for more movement */}
        <div 
          className="absolute w-48 h-48 rounded-full opacity-[0.05] dark:opacity-[0.04] blur-2xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-700) 0%, var(--violet-600) 30%, transparent 70%)',
            top: '30%',
            left: '5%',
            animation: 'float4 35s ease-in-out infinite'
          }}
        />

        <div 
          className="absolute w-80 h-80 rounded-full opacity-[0.04] dark:opacity-[0.06] blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-500) 0%, var(--violet-400) 30%, transparent 70%)',
            bottom: '5%',
            right: '5%',
            animation: 'float5 40s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Subtle Violet Lines */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Diagonal violet line 1 */}
        <div 
          className="absolute w-px h-screen opacity-[0.08] dark:opacity-[0.06]"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--violet-500) 50%, transparent 100%)',
            left: '20%',
            transform: 'rotate(15deg)',
            transformOrigin: 'center',
            animation: 'lineFloat1 40s ease-in-out infinite'
          }}
        />
        
        {/* Diagonal violet line 2 */}
        <div 
          className="absolute w-px h-screen opacity-[0.08] dark:opacity-[0.06]"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--violet-600) 50%, transparent 100%)',
            right: '25%',
            transform: 'rotate(-20deg)',
            transformOrigin: 'center',
            animation: 'lineFloat2 45s ease-in-out infinite reverse'
          }}
        />

        {/* Additional moving violet lines */}
        <div 
          className="absolute w-px h-screen opacity-[0.06] dark:opacity-[0.04]"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--violet-400) 50%, transparent 100%)',
            left: '60%',
            transform: 'rotate(25deg)',
            transformOrigin: 'center',
            animation: 'lineFloat3 50s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(40px, -30px) scale(1.1) rotate(90deg); }
          50% { transform: translate(-30px, 40px) scale(0.9) rotate(180deg); }
          75% { transform: translate(30px, 20px) scale(1.05) rotate(270deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-50px, -40px) scale(1.2) rotate(120deg); }
          66% { transform: translate(40px, 30px) scale(0.8) rotate(240deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          20% { transform: translate(25px, 20px) scale(0.8) rotate(72deg); }
          40% { transform: translate(-20px, -25px) scale(1.1) rotate(144deg); }
          60% { transform: translate(30px, -15px) scale(0.9) rotate(216deg); }
          80% { transform: translate(-15px, 25px) scale(1.05) rotate(288deg); }
        }

        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-60px, 50px) scale(1.3) rotate(180deg); }
        }

        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(30px, -40px) scale(0.7) rotate(90deg); }
          75% { transform: translate(-40px, 30px) scale(1.2) rotate(270deg); }
        }
        
        @keyframes lineFloat1 {
          0%, 100% { transform: rotate(15deg) translateY(0) translateX(0); }
          25% { transform: rotate(20deg) translateY(-30px) translateX(10px); }
          50% { transform: rotate(18deg) translateY(-20px) translateX(-15px); }
          75% { transform: rotate(22deg) translateY(-40px) translateX(20px); }
        }
        
        @keyframes lineFloat2 {
          0%, 100% { transform: rotate(-20deg) translateY(0) translateX(0); }
          33% { transform: rotate(-25deg) translateY(20px) translateX(-10px); }
          66% { transform: rotate(-15deg) translateY(-15px) translateX(15px); }
        }

        @keyframes lineFloat3 {
          0%, 100% { transform: rotate(25deg) translateY(0) translateX(0); }
          50% { transform: rotate(30deg) translateY(-25px) translateX(-20px); }
        }
      `}</style>
    </>
  )
}

// Payment-themed geometric shapes
export function PaymentShapes() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Credit card shape */}
      <div 
        className="absolute w-16 h-10 rounded-lg border-2 border-gray-300 dark:border-white/10 opacity-30 dark:opacity-20"
        style={{
          top: '15%',
          left: '8%',
          animation: 'cardFloat 35s ease-in-out infinite'
        }}
      />
      
      {/* Currency symbol */}
      <div 
        className="absolute text-6xl font-bold opacity-[0.08] dark:opacity-[0.05] select-none text-gray-400 dark:text-white"
        style={{
          top: '70%',
          right: '10%',
          animation: 'symbolRotate 50s linear infinite'
        }}
      >
        $
      </div>
      
      {/* Abstract payment flow lines */}
      <svg 
        className="absolute w-64 h-32 opacity-[0.1] dark:opacity-[0.06] text-gray-400 dark:text-white"
        style={{
          top: '40%',
          left: '5%',
          animation: 'pathDraw 30s ease-in-out infinite'
        }}
        viewBox="0 0 200 100"
      >
        <path 
          d="M 20 50 Q 60 20 100 50 T 180 50" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Additional payment elements */}
      <div 
        className="absolute w-12 h-8 rounded border border-gray-300 dark:border-white/10 opacity-25 dark:opacity-15"
        style={{
          top: '55%',
          right: '20%',
          animation: 'cardFloat2 42s ease-in-out infinite reverse'
        }}
      />

      <div 
        className="absolute text-4xl font-bold opacity-[0.06] dark:opacity-[0.04] select-none text-gray-400 dark:text-white"
        style={{
          top: '25%',
          left: '70%',
          animation: 'symbolFloat 38s ease-in-out infinite'
        }}
      >
        €
      </div>

      <style jsx>{`
        @keyframes cardFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(15px, -8px) rotate(3deg) scale(1.1); }
          50% { transform: translate(-8px, 15px) rotate(-2deg) scale(0.9); }
          75% { transform: translate(12px, 5px) rotate(1deg) scale(1.05); }
        }

        @keyframes cardFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-20px, 10px) rotate(-5deg) scale(1.2); }
        }
        
        @keyframes symbolRotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(0.9); }
          75% { transform: rotate(270deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes symbolFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.2); }
        }
        
        @keyframes pathDraw {
          0%, 100% { stroke-dashoffset: 0; opacity: 0.1; transform: translateX(0); }
          25% { stroke-dashoffset: 15; opacity: 0.15; transform: translateX(10px); }
          50% { stroke-dashoffset: 30; opacity: 0.12; transform: translateX(-5px); }
          75% { stroke-dashoffset: 45; opacity: 0.18; transform: translateX(15px); }
        }
      `}</style>
    </div>
  )
}

// Subtle particle effect
export function ParticleField() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 10
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
            opacity: 0.15,
            animation: `particleFloat ${15 + particle.delay}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes particleFloat {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.4;
          }
          15% { 
            transform: translate(30px, -40px) scale(1.3) rotate(54deg);
            opacity: 0.7;
          }
          30% { 
            transform: translate(-25px, 50px) scale(0.7) rotate(108deg);
            opacity: 0.5;
          }
          45% { 
            transform: translate(40px, 20px) scale(1.1) rotate(162deg);
            opacity: 0.6;
          }
          60% { 
            transform: translate(-15px, -30px) scale(0.9) rotate(216deg);
            opacity: 0.8;
          }
          75% { 
            transform: translate(35px, -10px) scale(1.2) rotate(270deg);
            opacity: 0.4;
          }
          90% { 
            transform: translate(-20px, 35px) scale(0.8) rotate(324deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}

// Premium gradient overlay
export function GradientOverlay() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      {/* Subtle violet radial gradients */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.03]"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, var(--violet-500) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, var(--violet-600) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, var(--violet-400) 0%, transparent 60%)
          `
        }}
      />
      
      {/* Ultra-subtle noise texture with violet tint */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.015] mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0.5 0 0.5 0 0.1 0 0.5 0.5 0 0.05 0.5 0 0.5 0 0.2 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
    </div>
  )
}

// Geometric accent shapes
export function GeometricAccents() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Subtle violet rectangles */}
      <div 
        className="absolute w-2 h-20 rounded-full"
        style={{
          background: 'var(--violet-500)',
          opacity: 0.2,
          top: '25%',
          right: '15%',
          transform: 'rotate(25deg)',
          animation: 'rectFloat1 45s ease-in-out infinite'
        }}
      />
      
      <div 
        className="absolute w-1 h-32 rounded-full"
        style={{
          background: 'var(--violet-600)',
          opacity: 0.25,
          bottom: '30%',
          left: '20%',
          transform: 'rotate(-15deg)',
          animation: 'rectFloat2 40s ease-in-out infinite reverse'
        }}
      />
      
      {/* Subtle violet circles */}
      <div 
        className="absolute w-8 h-8 rounded-full"
        style={{
          border: '1px solid var(--violet-500)',
          opacity: 0.3,
          top: '40%',
          right: '8%',
          animation: 'circleFloat 35s ease-in-out infinite'
        }}
      />

      {/* Additional geometric shapes */}
      <div 
        className="absolute w-3 h-16 rounded-full"
        style={{
          background: 'var(--violet-400)',
          opacity: 0.15,
          top: '65%',
          left: '75%',
          transform: 'rotate(45deg)',
          animation: 'rectFloat3 38s ease-in-out infinite'
        }}
      />

      <div 
        className="absolute w-6 h-6 rounded-full"
        style={{
          border: '1px solid var(--violet-600)',
          opacity: 0.25,
          top: '15%',
          left: '35%',
          animation: 'circleFloat2 42s ease-in-out infinite reverse'
        }}
      />

      <style jsx>{`
        @keyframes rectFloat1 {
          0%, 100% { transform: rotate(25deg) translateY(0) translateX(0) scale(1); }
          25% { transform: rotate(30deg) translateY(-20px) translateX(10px) scale(1.1); }
          50% { transform: rotate(35deg) translateY(-15px) translateX(-5px) scale(0.9); }
          75% { transform: rotate(20deg) translateY(-25px) translateX(15px) scale(1.05); }
        }
        
        @keyframes rectFloat2 {
          0%, 100% { transform: rotate(-15deg) translateY(0) translateX(0) scale(1); }
          33% { transform: rotate(-20deg) translateY(25px) translateX(-10px) scale(1.2); }
          66% { transform: rotate(-10deg) translateY(-20px) translateX(8px) scale(0.8); }
        }

        @keyframes rectFloat3 {
          0%, 100% { transform: rotate(45deg) translateY(0) scale(1); }
          50% { transform: rotate(50deg) translateY(-30px) scale(1.3); }
        }
        
        @keyframes circleFloat {
          0%, 100% { transform: scale(1) translateY(0) rotate(0deg); }
          25% { transform: scale(1.3) translateY(-10px) rotate(90deg); }
          50% { transform: scale(0.8) translateY(15px) rotate(180deg); }
          75% { transform: scale(1.1) translateY(-5px) rotate(270deg); }
        }

        @keyframes circleFloat2 {
          0%, 100% { transform: scale(1) translateX(0) rotate(0deg); }
          50% { transform: scale(1.4) translateX(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
} 