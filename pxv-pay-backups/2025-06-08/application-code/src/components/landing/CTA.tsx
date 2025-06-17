import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

const CTA = () => {
  return (
    <section className="py-32 bg-transparent dark:bg-transparent">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA with violet gradient */}
          <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>
            
            {/* Violet accent orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium text-violet-100 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Ready to get started?
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block">Start accepting</span>
                <span className="block">global payments today</span>
              </h2>
              
              <p className="max-w-2xl mx-auto text-xl text-violet-100 leading-relaxed">
                Join thousands of businesses using PXV Pay to collect payments globally. 
                Set up takes less than 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group border-0"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white font-semibold px-8 py-6 text-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>
              </div>
            </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black dark:text-white">
                Trusted by industry leaders
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                From startups to enterprise, businesses choose PXV Pay for reliable payment processing
              </p>
                  </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              {/* Placeholder for company logos */}
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-12 bg-gradient-to-r from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold text-sm"
                >
                  Company {i}
                </div>
              ))}
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>No monthly fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA 