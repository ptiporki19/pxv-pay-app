import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication - PXV Pay',
  description: 'Authentication pages for PXV Pay',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent relative">
      {/* Background Effects */}
      <AmbientLighting />
      <DepthLayers />
      <GradientOverlay />
      <BackgroundEffects />
      <PaymentShapes />
      <ParticleField />
      
      <div className="container mx-auto px-6 py-12 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl">
          {/* Left side - Auth form */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="w-full space-y-8">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-violet-700 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-violet-500/25">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-xl font-bold text-black dark:text-white tracking-tight">PXV Pay</span>
                </Link>
                
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center transition-colors duration-300">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to home
                </Link>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50">
                {children}
              </div>
            </div>
          </div>
          
          {/* Right side - Branded content */}
          <div className="hidden md:flex md:col-span-3 relative">
            <div className="w-full h-full bg-gradient-to-br from-violet-600/90 to-violet-800/90 backdrop-blur-sm rounded-3xl overflow-hidden border border-violet-500/20 shadow-xl">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
              </div>
              
              {/* Violet accent orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/30 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center p-12 h-full text-white">
                <div className="max-w-md space-y-8 text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium text-violet-100 mb-6">
                    <div className="w-2 h-2 bg-violet-300 rounded-full mr-2 animate-pulse"></div>
                    Trusted by 10,000+ businesses
                  </div>
                  
                  <h2 className="text-4xl font-bold">
                    <span className="block">Global Payments</span>
                    <span className="block">Local Methods</span>
                  </h2>
                  
                  <p className="text-lg text-violet-100">
                    Collect payments from customers worldwide with their preferred local payment methods. PXV Pay simplifies cross-border transactions for businesses of all sizes.
                  </p>
                  
                  <div className="space-y-6 pt-6">
                    <div className="flex items-center justify-center space-x-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">180+</div>
                        <div className="text-sm text-violet-200">Countries</div>
                      </div>
                      <div className="h-12 w-px bg-white/20"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">300+</div>
                        <div className="text-sm text-violet-200">Payment Methods</div>
                      </div>
                      <div className="h-12 w-px bg-white/20"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">99.9%</div>
                        <div className="text-sm text-violet-200">Uptime</div>
                      </div>
                    </div>
                    
                    <div className="pt-6 text-sm text-violet-200 font-medium">
                      "PXV Pay revolutionized how we collect payments globally. Setup took minutes, not months."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 