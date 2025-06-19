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
  BarChart3, 
  Palette, 
  Zap,
  ArrowRight,
  Users,
  Clock,
  Lock,
  Smartphone,
  DollarSign,
  CheckCircle
} from 'lucide-react'

const mainFeatures = [
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Accept all payment methods by allowing users to configure their preferred payment options and processors for their specific business needs.',
    link: '/features/payment-methods',
    highlights: ['All Payment Methods', 'User Configured', 'Flexible Setup'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Enable users to expand their business to 180+ countries with localized payment experiences and multi-currency support.',
    link: '/features/global-coverage',
    highlights: ['180+ Countries', 'Multi-Currency', 'Local Experience'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
  {
    icon: ShieldCheck,
    title: 'Security',
    description: 'Instant payment verification with proof of payment. Users can verify transactions instantly and view payment confirmations in real-time.',
    link: '/features/security',
    highlights: ['Instant Verification', 'Payment Proof', 'Real-time Processing'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
  {
    icon: Palette,
    title: 'Customization',
    description: 'Sell products with fully customizable checkout experiences. Configure different flows for various products and business use cases.',
    link: '/features/customization',
    highlights: ['Sell Products', 'Custom Checkout', 'Multiple Use Cases'],
    color: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20'
  },
]

const additionalFeatures = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights into payment performance, conversion rates, and customer behavior with real-time dashboards.',
    benefits: ['Real-time Dashboards', 'Conversion Tracking', 'Customer Insights']
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Get your money immediately after transactions. No more waiting 2-5 business days for settlement.',
    benefits: ['Instant Payouts', 'Real-time Processing', 'Cash Flow Optimization']
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Collaborate with your team using role-based access controls, audit logs, and permission management.',
    benefits: ['Role-based Access', 'Audit Logs', 'Team Collaboration']
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock support from payment experts with dedicated account management for enterprise clients.',
    benefits: ['Expert Support', 'Dedicated Account Manager', 'Global Coverage']
  },
  {
    icon: Lock,
    title: 'Data Protection',
    description: 'GDPR compliant data handling with encryption at rest and in transit, plus regular security audits.',
    benefits: ['GDPR Compliant', 'End-to-end Encryption', 'Regular Audits']
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Seamless mobile payment experience with responsive design and mobile wallet integration.',
    benefits: ['Mobile Wallets', 'Responsive Design', 'Touch Optimized']
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
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-8 mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Comprehensive Features
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Everything you need for</span>
                <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">global payments</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                PXV Pay provides a complete payment infrastructure that scales with your business, from startups to enterprise. 
                Explore our comprehensive suite of features designed to simplify global payments.
              </p>
            </div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {mainFeatures.map((feature, index) => (
                <Link 
                  key={index}
                  href={feature.link}
                  className="group block"
                >
                  <div className={`relative h-full bg-gradient-to-br ${feature.color} rounded-3xl p-8 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                      {/* Icon and Title */}
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500 transition-all duration-300">
                          <feature.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-black dark:text-white">
                            {feature.title}
                          </h3>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300 mt-1" />
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                      
                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2">
                        {feature.highlights.map((highlight, i) => (
                          <span 
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 backdrop-blur-sm"
                          >
                            <CheckCircle className="w-3 h-3 mr-1 text-violet-500" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                More Powerful Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover additional capabilities that make PXV Pay the complete payment solution for your business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3 mr-2 text-violet-500 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
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
                Ready to get started?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join thousands of businesses using PXV Pay to accept global payments. 
                Set up takes less than 5 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/25 group border-0">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" size="lg" className="bg-violet-100 dark:bg-violet-900 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 hover:border-violet-500 dark:hover:border-violet-500 font-semibold px-8 py-6 text-lg transition-all duration-300">
                    Learn More
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