'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
// import Image from 'next/image' // Remove colorful image import
import { cn } from '@/lib/utils'

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-black">
      {/* Background gradient/effect - subtle grayscale */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(to_top,white,transparent)] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left side: Text and CTAs */}
          <div className="flex-1 lg:text-left text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter text-gray-900 dark:text-gray-100">
              <span className="block">Global Payments,</span>
              <span className="block">Local Methods</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl lg:mx-0 mx-auto">
              Empower your business with PXV Pay's modern, secure payment platform. Collect payments globally using local payment methods.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/signup">
                <Button size="lg" className="px-8 rounded border border-gray-900 dark:border-gray-100 hover:bg-gray-100 hover:dark:bg-gray-800">
                  Get Started
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="px-8 rounded border-gray-300 dark:border-gray-700 hover:bg-gray-100 hover:dark:bg-gray-800">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Placeholder for subtle social proof */}
            <div className="mt-12 flex items-center gap-4 justify-center lg:justify-start text-gray-600 dark:text-gray-400">
               <div className="flex items-center -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200">
                     {/* Placeholder for avatar/initials */}
                     <span className="text-sm font-medium">U{i}</span>
                  </div>
                ))}
                 <div className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-900 dark:text-gray-100">
                     <span className="text-xs font-medium">+10K</span>
                  </div>
              </div>
              <div>
                <span className="block text-sm font-medium">Trusted by 10,000+ businesses</span>
                <span className="block text-xs text-gray-500 dark:text-gray-500">worldwide</span>
              </div>
            </div>
          </div>

          {/* Right side: Elegant Design Element */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none mx-auto">
            {/* Example: Abstract geometric shape or layered cards in grayscale */}
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
               {/* Subtle Pattern or Gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-gray-50 dark:from-gray-900 to-white dark:to-black opacity-50" />
               {/* Placeholder abstract element */}
               <div className="relative z-10 h-full flex items-center justify-center">
                 <div className="w-3/4 h-3/4 border-4 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-500 text-sm">
                   Elegant Visual Placeholder
                 </div>
               </div>
            </div>
            
            {/* Floating elements - simplified/monochrome */}
            <div className="absolute -right-4 top-10 w-16 h-16 bg-white dark:bg-gray-900 rounded-lg shadow-md flex items-center justify-center rotate-6 border border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-gray-100 text-2xl font-bold">$</span>
            </div>
            <div className="absolute -left-4 bottom-10 w-16 h-16 bg-white dark:bg-gray-900 rounded-lg shadow-md flex items-center justify-center -rotate-6 border border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-gray-100 text-2xl font-bold">£</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero 