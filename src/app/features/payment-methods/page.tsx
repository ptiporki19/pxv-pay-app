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
  Settings, 
  Globe,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Banknote,
  Wallet
} from 'lucide-react'

const paymentFeatures = [
  {
    icon: Settings,
    title: 'Customizable Setup',
    description: 'Configure your own payment methods based on your business needs. Add bank transfers, mobile money, or any payment option your customers prefer.',
    benefits: ['Your choice of methods', 'Easy configuration', 'Flexible setup']
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Accept payments from customers worldwide. Support for 180+ countries with local payment preferences and currency options.',
    benefits: ['180+ countries', 'Local preferences', 'Multi-currency']
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Seamless payment experience on all devices. Your customers can pay easily whether they\'re on mobile, tablet, or desktop.',
    benefits: ['Mobile-first design', 'Touch-friendly', 'Responsive layout']
  },
  {
    icon: CheckCircle,
    title: 'Instant Verification',
    description: 'Verify payments instantly with proof of payment. Know immediately when your customers complete their transactions.',
    benefits: ['Real-time verification', 'Payment proof', 'Instant notifications']
  },
]

const useCases = [
  {
    icon: CreditCard,
    title: 'E-commerce Stores',
    description: 'Perfect for online stores selling products globally',
    example: 'Accept payments for your online shop from customers worldwide'
  },
  {
    icon: Banknote,
    title: 'Service Businesses',
    description: 'Ideal for consultants, freelancers, and service providers',
    example: 'Collect payments for consulting, design, or professional services'
  },
  {
    icon: Wallet,
    title: 'Digital Products',
    description: 'Great for selling digital downloads and subscriptions',
    example: 'Sell courses, software, or digital content with ease'
  },
]

export default function PaymentMethodsPage() {
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
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Payment Methods
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Customizable Payment</span>
                <span className="block text-violet-600 dark:text-violet-400">Experience</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Configure your own payment methods and create a payment experience that works for your business and your customers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/25 group border-0">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="lg" className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-500 dark:hover:border-violet-500 font-semibold px-8 py-6 text-lg transition-all duration-300 backdrop-blur-sm">
                    View All Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Features Section - Has background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <section className="py-20 bg-transparent dark:bg-transparent">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  PXV Pay puts you in control of your payment experience
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {paymentFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="mb-6">
                      <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                        <feature.icon className="w-7 h-7 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-black dark:text-white">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                      
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-violet-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 3. Use Cases Section - No background (shows animations) */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Perfect For Any Business
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Whether you're selling products, services, or digital content, PXV Pay adapts to your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="group text-center bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                      <useCase.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {useCase.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {useCase.description}
                    </p>
                    
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                      {useCase.example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CTA Section - Has background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
          <section className="py-20 bg-transparent dark:bg-transparent">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                  Ready to customize your payment experience?
                </h2>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Start accepting payments with methods that work for your business and your customers.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/25 group border-0">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-500 dark:hover:border-violet-500 font-semibold px-8 py-6 text-lg transition-all duration-300">
                      Contact Sales
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