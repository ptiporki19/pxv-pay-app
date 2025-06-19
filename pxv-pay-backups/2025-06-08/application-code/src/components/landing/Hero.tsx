'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Globe, Shield, Zap, Users } from 'lucide-react'

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
        <div className="text-center space-y-12">
          {/* Hero headline */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 text-sm font-medium text-violet-700 dark:text-violet-300 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
              Modern Payment Infrastructure
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black dark:text-white leading-[0.9]">
              <span className="block">Global Payments,</span>
              <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">Local Methods</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Empower your business with PXV Pay's modern payment platform. Accept payments globally using local methods with instant settlement and transparent pricing.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/25 group border-0">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/features">
              <Button variant="outline" size="lg" className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-500 dark:hover:border-violet-500 font-semibold px-8 py-6 text-lg transition-all duration-300 backdrop-blur-sm">
                View Features
                </Button>
              </Link>
            </div>

          {/* Social proof */}
          <div className="pt-16 space-y-8">
            <div className="flex items-center justify-center space-x-6 text-gray-500 dark:text-gray-400">
               <div className="flex items-center -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 text-sm font-medium">
                    {String.fromCharCode(65 + i - 1)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold">
                  +1K
                  </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">Trusted by 1,000+ businesses</div>
                <div className="text-sm">Processing $10M+ monthly</div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8">
              <div className="group text-center space-y-3 p-6 rounded-2xl border border-violet-100 dark:border-violet-900 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-all duration-300 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-300">
                  <Globe className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-black dark:text-white">180+ Countries</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accept payments globally with local payment methods</p>
          </div>

              <div className="group text-center space-y-3 p-6 rounded-2xl border border-violet-100 dark:border-violet-900 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-all duration-300 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                 </div>
                <h3 className="font-semibold text-black dark:text-white">Bank-Grade Security</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">PCI DSS compliant with advanced fraud protection</p>
            </div>
            
              <div className="group text-center space-y-3 p-6 rounded-2xl border border-violet-100 dark:border-violet-900 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-all duration-300 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-300">
                  <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-black dark:text-white">Instant Settlement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get your money immediately, not in days</p>
            </div>
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