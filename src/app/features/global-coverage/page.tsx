'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  Globe, 
  Users, 
  Building,
  ArrowRight,
  CheckCircle,
  MapPin,
  Banknote,
  Shield
} from 'lucide-react'

const globalFeatures = [
  {
    icon: Globe,
    title: 'Universal Access',
    description: 'No matter where you are in the world, PXV Pay works for your business. Our platform is designed to be accessible from anywhere with an internet connection.',
    benefits: ['Available worldwide', 'No geographic restrictions', 'Multi-language support']
  },
  {
    icon: Banknote,
    title: 'Multi-Currency Support',
    description: 'Accept payments in multiple currencies and let your customers pay in their preferred currency for a better payment experience.',
    benefits: ['Multiple currencies', 'Real-time conversion', 'Local pricing']
  },
  {
    icon: Users,
    title: 'Local Payment Preferences',
    description: 'Configure payment methods that your customers prefer in their region. From bank transfers to mobile money, adapt to local preferences.',
    benefits: ['Regional preferences', 'Local methods', 'Cultural adaptation']
  },
  {
    icon: Shield,
    title: 'Compliance Ready',
    description: 'Built with international compliance standards in mind. Our platform helps you meet regulatory requirements across different markets.',
    benefits: ['International standards', 'Regulatory compliance', 'Security protocols']
  },
]

const businessTypes = [
  {
    icon: Building,
    title: 'Small Businesses',
    description: 'Perfect for local businesses looking to expand globally',
    example: 'Start accepting international customers without complex setup'
  },
  {
    icon: MapPin,
    title: 'E-commerce Stores',
    description: 'Ideal for online stores selling to customers worldwide',
    example: 'Reach customers in any country with localized payment options'
  },
  {
    icon: Users,
    title: 'Service Providers',
    description: 'Great for consultants and freelancers with global clients',
    example: 'Accept payments from clients anywhere in the world'
  },
]

export default function GlobalCoveragePage() {
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
                Global Coverage
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Accept Payments</span>
                <span className="block text-violet-600 dark:text-violet-400">From Anywhere</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                No matter where your customers are located, PXV Pay makes it easy to accept payments globally. 
                Every country, every business, every opportunity.
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

        {/* 2. Global Features Section - Has background */}
        <div className="bg-violet-50 dark:bg-violet-950/30">
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                  Built for Global Business
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  PXV Pay removes geographic barriers and makes global payments accessible to everyone
              </p>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {globalFeatures.map((feature, index) => (
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

        {/* 3. Universal Access Section - No background (shows animations) */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                  Every Country, Every Business
              </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  PXV Pay believes that geography shouldn't limit business opportunities. 
                  Whether you're in a major city or a remote location, our platform works for you.
              </p>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl">
                  <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center">
                    <Globe className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white">
                    180+ Countries
                      </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Available in countries worldwide
                  </p>
                    </div>
                    
                <div className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl">
                  <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center">
                    <Banknote className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white">
                    Multiple Currencies
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Support for major world currencies
                  </p>
                </div>

                <div className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl">
                  <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white">
                    Any Business Size
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    From startups to enterprises
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Business Types Section - Has background */}
        {/* Business Types Section */}
        <section className="py-20 bg-violet-50 dark:bg-violet-950/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Perfect For Any Business
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                No matter what type of business you run, PXV Pay adapts to your global payment needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {businessTypes.map((business, index) => (
                <div 
                  key={index}
                  className="group text-center bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                      <business.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {business.title}
                  </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {business.description}
                    </p>
                    
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                      {business.example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                Ready to go global?
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Start accepting payments from customers anywhere in the world. 
                No geographic limits, no complex setup.
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
      </main>
      
      <Footer />
    </div>
  )
} 