'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Image } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent dark:bg-transparent">
      {/* Violet accent elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Subtle violet glow */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-[0.08] dark:opacity-[0.12] blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-500) 0%, transparent 70%)',
            top: '20%',
            left: '10%',
            animation: 'violetFloat1 30s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-[0.06] dark:opacity-[0.10] blur-2xl"
          style={{
            background: 'radial-gradient(circle, var(--violet-400) 0%, transparent 70%)',
            bottom: '30%',
            right: '15%',
            animation: 'violetFloat2 25s ease-in-out infinite reverse'
          }}
        />
      </div>

      <div className="container mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-10">
            <div className="space-y-8">
              {/* Massive, impactful heading */}
              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight text-black dark:text-white leading-[0.85]">
                <span className="block">Global Payments,</span>
                <span className="block text-violet-600 dark:text-violet-400">Local Methods</span>
              </h1>

              {/* Larger, more readable description */}
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 leading-relaxed font-light max-w-2xl">
                Empower your business with PXV Pay's customizable payment platform. Configure your own payment methods and accept payments worldwide with transparent pricing.
              </p>
            </div>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Link href="/signup">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-10 py-7 text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/25 group border-0 rounded-2xl">
                  Get Started Free
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-500 dark:hover:border-violet-500 font-semibold px-10 py-7 text-xl transition-all duration-300 backdrop-blur-sm rounded-2xl">
                  View Features
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Enhanced Image placeholder */}
          <div className="lg:pl-8">
            <div className="relative">
              <div className="aspect-[4/3] bg-violet-50 dark:bg-violet-950/20 rounded-3xl border-2 border-dashed border-violet-200 dark:border-violet-800 flex items-center justify-center group hover:border-violet-300 dark:hover:border-violet-700 transition-colors duration-300">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-violet-100 dark:bg-violet-900 rounded-3xl flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-300">
                    <Image className="w-10 h-10 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-heading font-semibold text-xl text-black dark:text-white">Hero Image</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Payment platform visualization</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-violet-500 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-violet-400 rounded-full animate-pulse opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Violet animation keyframes */}
      <style jsx>{`
        @keyframes violetFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(30px, -20px) scale(1.1) rotate(90deg); }
          50% { transform: translate(-20px, 30px) scale(0.9) rotate(180deg); }
          75% { transform: translate(25px, 15px) scale(1.05) rotate(270deg); }
        }
        
        @keyframes violetFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-40px, -30px) scale(1.2) rotate(120deg); }
          66% { transform: translate(30px, 25px) scale(0.8) rotate(240deg); }
        }
      `}</style>
    </section>
  )
}

export default Hero 