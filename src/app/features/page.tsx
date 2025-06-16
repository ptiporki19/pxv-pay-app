'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  Palette,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Lock,
  Smartphone,
  DollarSign,
  Zap
} from 'lucide-react'

const mainFeatures = [
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Configure your preferred payment methods and processors. Set up multiple payment options tailored to your business needs and customer preferences.',
    link: '/features/payment-methods',
    highlights: ['Multiple Processors', 'Easy Configuration', 'Flexible Setup'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Expand your business to 180+ countries with localized payment experiences and multi-currency support for international growth.',
    link: '/features/global-coverage',
    highlights: ['180+ Countries', 'Multi-Currency', 'Local Experience'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
  {
    icon: ShieldCheck,
    title: 'Security',
    description: 'Instant payment verification with proof of payment. Verify transactions instantly and provide real-time payment confirmations.',
    link: '/features/security',
    highlights: ['Instant Verification', 'Payment Proof', 'Real-time Processing'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
  {
    icon: Palette,
    title: 'Customization',
    description: 'Create custom checkout experiences for different products and business models. Configure unique flows for various use cases.',
    link: '/features/customization',
    highlights: ['Custom Checkout', 'Product Sales', 'Multiple Use Cases'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
]

const additionalFeatures = [
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Get your money immediately after transactions with real-time processing and instant payouts.',
    benefits: ['Instant Payouts', 'Real-time Processing', 'Cash Flow Optimization']
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Collaborate with your team using role-based access controls and permission management.',
    benefits: ['Role-based Access', 'Team Collaboration', 'Permission Control']
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock support from payment experts with dedicated assistance for your business.',
    benefits: ['Expert Support', 'Always Available', 'Business Focused']
  },
  {
    icon: Lock,
    title: 'Data Protection',
    description: 'Enterprise-grade security with encryption and compliance standards for data protection.',
    benefits: ['Encrypted Data', 'Compliance Ready', 'Secure Processing']
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Seamless mobile payment experience with responsive design and mobile-first approach.',
    benefits: ['Mobile Friendly', 'Responsive Design', 'Touch Optimized']
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Clear, transparent pricing with no hidden fees and competitive rates for your business.',
    benefits: ['No Hidden Fees', 'Competitive Rates', 'Clear Pricing']
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {/* Background Effects */}
      <AmbientLighting />
      <DepthLayers />
      <GradientOverlay />
      <BackgroundEffects />
      <PaymentShapes />
      <ParticleField />
      <GeometricAccents />
      
      <Header />
      
      <main className="flex-1">
        {/* 1. Hero Section - No background (shows animations) */}
        <section className="relative pt-32 pb-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-8 mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Complete Payment Platform
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Everything you need for</span>
                <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">global payments</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                PXV Pay provides a comprehensive payment infrastructure that adapts to your business needs, 
                from simple checkouts to complex multi-currency operations.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Main Features - Light violet background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <section className="py-20 bg-transparent dark:bg-transparent">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                  Core Platform Features
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Four powerful features that make PXV Pay the complete solution for your payment needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {mainFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                        <feature.icon className="w-7 h-7 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-black dark:text-white">
                          {feature.title}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                      
                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2">
                        {feature.highlights.map((highlight, i) => (
                          <span 
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                      
                      {/* CTA */}
                      <div className="pt-4">
                        <Link href={feature.link}>
                          <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2 transition-all duration-300 hover:shadow-lg border-0 rounded-xl group-hover:scale-105">
                            Learn More
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 3. Additional Features - No background (shows animations) */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Additional Platform Benefits
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                More features that make PXV Pay the complete payment solution for your business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3 h-3 text-violet-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CTA Section - Has background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <section className="py-20 bg-transparent dark:bg-transparent">
            <div className="container mx-auto px-6">
              <div className="text-center space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                  Ready to transform your payments?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Start building your payment infrastructure today with PXV Pay's comprehensive platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:shadow-xl border-0 rounded-xl">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-violet-500 dark:hover:border-violet-500 font-semibold px-8 py-6 text-lg transition-all duration-300 rounded-xl">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
