'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  Palette, 
  Code,
  Smartphone,
  Settings,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Zap,
  Eye,
  Brush,
  Monitor
} from 'lucide-react'

const customizationOptions = [
  {
    icon: Code,
    title: 'Product Checkout Flows',
    description: 'Create custom checkout experiences for different products. Configure unique flows for physical goods, digital products, subscriptions, and services.',
    features: [
      'Product-specific checkout',
      'Digital delivery options',
      'Subscription billing',
      'Service booking flows'
    ],
    preview: 'Tailored checkout for every product type'
  },
  {
    icon: Settings,
    title: 'Multi-Use Case Configuration',
    description: 'Set up different checkout experiences for various business models - e-commerce, services, bookings, donations, and more.',
    features: [
      'E-commerce checkout',
      'Service appointments',
      'Event ticketing',
      'Donation campaigns'
    ],
    preview: 'One platform for all business models'
  },
  {
    icon: Palette,
    title: 'Brand Customization',
    description: 'Make the payment experience seamlessly integrate with your brand identity and design system.',
    features: [
      'Custom colors and themes',
      'Logo and brand assets',
      'Font and typography',
      'CSS customization'
    ],
    preview: 'Customize colors, fonts, logos, and overall visual identity'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Optimize product selling for mobile devices with responsive design and mobile wallet integration.',
    features: [
      'Mobile-optimized UI',
      'Touch-friendly controls',
      'Mobile wallet integration',
      'Progressive web app'
    ],
    preview: 'Perfect mobile selling experience'
  }
]

const integrationMethods = [
  {
    method: 'Drop-in UI',
    description: 'Pre-built payment components that can be embedded into your website with minimal code.',
    difficulty: 'Easy',
    timeToImplement: '30 minutes',
    features: ['Pre-built components', 'Automatic updates', 'Mobile responsive', 'Theme customization']
  },
  {
    method: 'Custom Integration',
    description: 'Full API access for complete control over the payment experience and user interface.',
    difficulty: 'Advanced',
    timeToImplement: '2-4 weeks',
    features: ['Complete control', 'Custom UI/UX', 'Advanced features', 'Full API access']
  },
  {
    method: 'Payment Links',
    description: 'Share payment links via email, SMS, or social media for quick and easy transactions.',
    difficulty: 'No Code',
    timeToImplement: '5 minutes',
    features: ['No coding required', 'Share anywhere', 'Mobile optimized', 'Quick setup']
  }
]

const designSystem = [
  {
    category: 'Colors',
    options: ['Primary colors', 'Secondary colors', 'Success/error states', 'Background colors'],
    description: 'Match your brand colors perfectly'
  },
  {
    category: 'Typography',
    options: ['Font families', 'Font sizes', 'Font weights', 'Line heights'],
    description: 'Consistent typography across your brand'
  },
  {
    category: 'Layout',
    options: ['Container widths', 'Spacing', 'Border radius', 'Shadows'],
    description: 'Seamless integration with your design'
  },
  {
    category: 'Components',
    options: ['Button styles', 'Input fields', 'Cards', 'Loading states'],
    description: 'Customizable UI components'
  }
]

const examples = [
  {
    title: 'E-commerce Store',
    description: 'Seamless integration with product pages and shopping cart',
    features: ['Product-specific checkout', 'Inventory integration', 'Shipping options', 'Tax calculation']
  },
  {
    title: 'SaaS Platform',
    description: 'Subscription management and recurring billing integration',
    features: ['Subscription tiers', 'Usage-based billing', 'Trial periods', 'Plan upgrades']
  },
  {
    title: 'Marketplace',
    description: 'Multi-vendor payments with split transactions',
    features: ['Vendor payouts', 'Commission tracking', 'Escrow payments', 'Dispute resolution']
  },
  {
    title: 'Mobile App',
    description: 'Native mobile payment experience with app integration',
    features: ['In-app purchases', 'Mobile wallets', 'Biometric auth', 'Offline payments']
  }
]

export default function CustomizationPage() {
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
              <span className="text-black dark:text-white">Customization</span>
            </div>
            
            <div className="text-center space-y-8 mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Sell Products & Customize
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Sell products with</span>
                <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">custom checkout flows</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Customize your payment experience to match your brand. Create product-specific checkout flows 
                and tailor the interface to fit your business needs perfectly.
              </p>
            </div>
          </div>
        </section>

        {/* Customization Options */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Endless Customization
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tailor every aspect of the payment experience to match your brand and user needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {customizationOptions.map((option, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="space-y-6">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50 rounded-2xl flex items-center justify-center">
                        <option.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {option.title}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {option.description}
                    </p>
                    
                    {/* Preview */}
                    <div className="bg-white/60 dark:bg-black/60 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        {option.preview}
                      </p>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      {option.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Methods */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Integration Options
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the integration method that best fits your technical requirements and timeline
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {integrationMethods.map((method, index) => (
                <div 
                  key={index}
                  className="bg-violet-50 dark:bg-violet-950/30 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {method.method}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
                        <div className="font-semibold text-black dark:text-white">{method.difficulty}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Setup Time</div>
                        <div className="font-semibold text-black dark:text-white">{method.timeToImplement}</div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      {method.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Design System */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Design System Integration
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Seamlessly integrate with your existing design system and style guide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {designSystem.map((system, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mx-auto">
                    <Brush className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {system.category}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {system.description}
                  </p>
                  <div className="space-y-1">
                    {system.options.map((option, i) => (
                      <div key={i} className="text-xs text-gray-500 dark:text-gray-400">
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Case Examples */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Real-World Examples
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                See how different business types customize their payment experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {examples.map((example, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="space-y-6">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white">
                          {example.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {example.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      {example.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                Create your perfect payment experience
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Start customizing your payment flow to match your brand and optimize for conversions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                    Start Customizing
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