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
  MapPin,
  DollarSign,
  Languages,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Zap,
  Clock,
  Users
} from 'lucide-react'

const regions = [
  {
    name: 'North America',
    countries: 23,
    currencies: ['USD', 'CAD', 'MXN'],
    paymentMethods: ['Cards', 'ACH', 'PayPal', 'Apple Pay', 'Google Pay'],
    coverage: '98%'
  },
  {
    name: 'Europe',
    countries: 44,
    currencies: ['EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'PLN'],
    paymentMethods: ['Cards', 'SEPA', 'iDEAL', 'Klarna', 'Bancontact'],
    coverage: '96%'
  },
  {
    name: 'Asia Pacific',
    countries: 42,
    currencies: ['JPY', 'CNY', 'KRW', 'AUD', 'INR', 'SGD'],
    paymentMethods: ['Cards', 'Alipay', 'WeChat Pay', 'UPI', 'JCB'],
    coverage: '94%'
  },
  {
    name: 'Latin America',
    countries: 33,
    currencies: ['BRL', 'ARS', 'CLP', 'COP', 'PEN'],
    paymentMethods: ['Cards', 'PIX', 'OXXO', 'Boleto', 'Mercado Pago'],
    coverage: '89%'
  },
  {
    name: 'Middle East & Africa',
    countries: 38,
    currencies: ['AED', 'SAR', 'ZAR', 'EGP', 'NGN'],
    paymentMethods: ['Cards', 'Mobile Money', 'Bank Transfer', 'SADAD'],
    coverage: '85%'
  }
]

const features = [
  {
    icon: DollarSign,
    title: 'Multi-Currency Support',
    description: 'Accept payments in 135+ currencies with real-time exchange rates and automatic conversion.',
    details: [
      'Real-time exchange rates',
      'Automatic currency conversion',
      'Competitive FX rates',
      'Multi-currency payouts'
    ]
  },
  {
    icon: Languages,
    title: 'Localized Checkout',
    description: 'Provide native payment experiences with localized languages, currencies, and payment methods.',
    details: [
      '40+ languages supported',
      'Local payment preferences',
      'Regional compliance',
      'Cultural customization'
    ]
  },
  {
    icon: Clock,
    title: 'Global Settlement',
    description: 'Fast settlement times worldwide with local banking partnerships and optimized payout routes.',
    details: [
      'Next-day settlement',
      'Local banking partners',
      'Optimized routing',
      'Reduced settlement costs'
    ]
  },
  {
    icon: Users,
    title: 'Local Support',
    description: '24/7 customer support in multiple languages with regional expertise and local business hours.',
    details: [
      'Multi-language support',
      'Regional expertise',
      'Local business hours',
      'Dedicated account managers'
    ]
  }
]

const compliance = [
  {
    region: 'Global',
    standards: ['PCI DSS Level 1', 'ISO 27001', 'SOC 2 Type II'],
    description: 'International security and compliance standards'
  },
  {
    region: 'Europe',
    standards: ['GDPR', 'PSD2', 'Strong Customer Authentication'],
    description: 'European regulatory compliance and data protection'
  },
  {
    region: 'United States',
    standards: ['SOX', 'CCPA', 'State Money Transmitter Licenses'],
    description: 'US federal and state regulatory compliance'
  },
  {
    region: 'Asia Pacific',
    standards: ['APPI (Japan)', 'PDPA (Singapore)', 'Privacy Act (Australia)'],
    description: 'Regional privacy and data protection laws'
  }
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
              <span className="text-black dark:text-white">Global Coverage</span>
            </div>
            
            <div className="text-center space-y-8 mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                180+ Countries
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Global reach,</span>
                <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">local experience</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Expand your business worldwide with PXV Pay's comprehensive global payment infrastructure. 
                Accept payments in 180+ countries with localized experiences and multi-currency support.
              </p>
            </div>
          </div>
        </section>

        {/* Regional Coverage */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Regional Coverage
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Comprehensive payment infrastructure across all major regions worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regions.map((region, index) => (
                <div 
                  key={index}
                  className="bg-violet-50 dark:bg-violet-950/30 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {region.name}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                          {region.coverage}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Coverage
                        </div>
                      </div>
                    </div>
                    
                    {/* Countries */}
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {region.countries} countries
                      </span>
                    </div>
                    
                    {/* Currencies */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Supported Currencies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {region.currencies.map((currency, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 rounded"
                          >
                            {currency}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Payment Methods */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Popular Payment Methods
                      </div>
                      <div className="space-y-1">
                        {region.paymentMethods.map((method, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-violet-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Global Payment Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Advanced capabilities for international business expansion
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="space-y-6">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {feature.title}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Details */}
                    <div className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Global Compliance
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Meeting regulatory requirements across all major markets
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {compliance.map((item, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {item.region}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="space-y-1">
                    {item.standards.map((standard, i) => (
                      <div key={i} className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {standard}
                      </div>
                    ))}
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
                Go global with confidence
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Start accepting international payments and expand your business to new markets worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                    Start Global Expansion
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