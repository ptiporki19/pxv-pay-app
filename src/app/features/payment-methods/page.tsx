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
  Smartphone,
  Building,
  Globe,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Zap,
  Clock,
  Shield
} from 'lucide-react'

const paymentCategories = [
  {
    category: 'Card Payment Setup',
    icon: CreditCard,
    description: 'Configure credit and debit card processing with your preferred payment processor.',
    methods: [
      { name: 'Stripe Integration', coverage: 'Global', setup: 'API Configuration' },
      { name: 'PayPal Business', coverage: 'Global', setup: 'Merchant Account' },
      { name: 'Square Setup', coverage: 'US, UK, AU', setup: 'Business Account' },
      { name: 'Adyen Connect', coverage: 'Global', setup: 'Platform Integration' },
      { name: 'Braintree Config', coverage: 'Global', setup: 'SDK Integration' },
      { name: 'Custom Processor', coverage: 'Flexible', setup: 'API Integration' }
    ],
    features: ['Multiple processors', 'Failover routing', 'Custom integration', 'Testing sandbox']
  },
  {
    category: 'Digital Wallet Integration',
    icon: Smartphone,
    description: 'Set up popular digital wallets and mobile payment solutions for your customers.',
    methods: [
      { name: 'Apple Pay Setup', coverage: 'Global', setup: 'Developer Account' },
      { name: 'Google Pay Config', coverage: 'Global', setup: 'Merchant Setup' },
      { name: 'Samsung Pay', coverage: 'Global', setup: 'Partner Integration' },
      { name: 'PayPal Wallet', coverage: 'Global', setup: 'Business Integration' },
      { name: 'Regional Wallets', coverage: 'By Region', setup: 'Local Setup' },
      { name: 'Custom Wallets', coverage: 'Configurable', setup: 'API Integration' }
    ],
    features: ['One-click payments', 'Mobile optimization', 'Biometric auth', 'Express checkout']
  },
  {
    category: 'Bank Transfer Setup',
    icon: Building,
    description: 'Configure direct bank transfers and ACH processing for lower-cost transactions.',
    methods: [
      { name: 'ACH Processing', coverage: 'US', setup: 'Bank Partnership' },
      { name: 'SEPA Integration', coverage: 'Europe', setup: 'EU Bank Setup' },
      { name: 'Wire Transfers', coverage: 'Global', setup: 'Banking Config' },
      { name: 'Local Banking', coverage: 'Regional', setup: 'Local Partners' },
      { name: 'Open Banking', coverage: 'UK, EU', setup: 'API Integration' },
      { name: 'Custom Banking', coverage: 'Flexible', setup: 'Direct Integration' }
    ],
    features: ['Lower fees', 'Bank-grade security', 'Instant verification', 'Bulk processing']
  },
  {
    category: 'Regional Payment Methods',
    icon: Globe,
    description: 'Set up local payment methods preferred by customers in specific regions.',
    methods: [
      { name: 'Buy Now Pay Later', coverage: 'US, EU', setup: 'Partner Integration' },
      { name: 'Cryptocurrency', coverage: 'Global', setup: 'Wallet Integration' },
      { name: 'Mobile Money', coverage: 'Africa, Asia', setup: 'Local Providers' },
      { name: 'QR Code Payments', coverage: 'Asia', setup: 'Regional Setup' },
      { name: 'Cash Payments', coverage: 'Global', setup: 'Partner Network' },
      { name: 'Gift Cards', coverage: 'Configurable', setup: 'Custom Setup' }
    ],
    features: ['Local preference', 'Cultural fit', 'Regional compliance', 'Higher conversion']
  }
]

const benefits = [
  {
    icon: Clock,
    title: 'Quick Setup',
    description: 'Configure new payment methods in minutes with our intuitive setup wizard and comprehensive documentation.'
  },
  {
    icon: Shield,
    title: 'Secure Integration',
    description: 'All integrations follow industry security standards with built-in compliance and fraud protection.'
  },
  {
    icon: Globe,
    title: 'Global Flexibility',
    description: 'Adapt to any market by configuring local payment preferences and regional processing options.'
  },
  {
    icon: Zap,
    title: 'Smart Routing',
    description: 'Automatically route transactions through the best available payment method based on your configuration.'
  }
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
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <Link href="/features" className="hover:text-black dark:hover:text-white transition-colors duration-300 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Features
              </Link>
              <span>/</span>
              <span className="text-black dark:text-white">Payment Methods</span>
            </div>
            
            <div className="text-center space-y-8 mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                All Payment Methods Accepted
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Configure any</span>
                <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">payment method you need</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Set up and configure any payment method or processor that works for your business. 
                Our platform adapts to your preferred payment solutions and integrates with your chosen providers.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Categories */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="space-y-16">
              {paymentCategories.map((category, index) => (
                <div key={index} className="space-y-8">
                  {/* Category Header */}
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center">
                      <category.icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-black dark:text-white">
                        {category.category}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Methods Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {category.methods.map((method, methodIndex) => (
                      <div 
                        key={methodIndex}
                        className="bg-violet-50 dark:bg-violet-950/30 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-black dark:text-white">
                            {method.name}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {method.setup}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-black dark:text-white">
                          {method.coverage}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Category Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Why Choose PXV Pay
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Advanced payment infrastructure designed for global businesses
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mx-auto">
                    <benefit.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                Start accepting payments today
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get started with PXV Pay and give your customers the payment flexibility they expect.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-black dark:hover:border-white font-semibold px-8 py-6 text-lg transition-all duration-300">
                    Explore More Features
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