'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  Shield, 
  CheckCircle, 
  Eye,
  ArrowRight,
  Lock,
  FileCheck,
  AlertTriangle,
  Zap
} from 'lucide-react'

const securityFeatures = [
  {
    icon: CheckCircle,
    title: 'Instant Payment Verification',
    description: 'Verify payments instantly with our proof of payment system. Know immediately when customers complete their transactions with real payment confirmations.',
    benefits: ['Real-time verification', 'Instant notifications', 'Payment proof system']
  },
  {
    icon: Eye,
    title: 'Fraud Detection',
    description: 'Advanced fraud detection specifically designed to identify fake payment proofs and suspicious transaction patterns to protect your business.',
    benefits: ['Fake proof detection', 'Pattern recognition', 'Suspicious activity alerts']
  },
  {
    icon: Lock,
    title: 'Secure Data Handling',
    description: 'All payment data is encrypted and handled according to industry security standards. Your customer information and transaction data are always protected.',
    benefits: ['Data encryption', 'Secure storage', 'Privacy protection']
  },
  {
    icon: FileCheck,
    title: 'Transaction Monitoring',
    description: 'Continuous monitoring of all transactions to ensure authenticity and detect any irregularities in payment submissions.',
    benefits: ['24/7 monitoring', 'Authenticity checks', 'Irregularity detection']
  },
]

const protectionLevels = [
  {
    icon: Shield,
    title: 'Payment Proof Validation',
    description: 'Every payment proof is validated for authenticity',
    details: 'Our system checks payment proofs against known patterns and validates transaction details to ensure legitimacy.'
  },
  {
    icon: AlertTriangle,
    title: 'Fraud Prevention',
    description: 'Proactive detection of fraudulent payment attempts',
    details: 'Advanced algorithms identify suspicious patterns and fake payment proofs before they can impact your business.'
  },
  {
    icon: Zap,
    title: 'Real-time Alerts',
    description: 'Instant notifications for all payment activities',
    details: 'Get immediate alerts for successful payments, failed attempts, and any suspicious activities detected by our system.'
  },
]

export default function SecurityPage() {
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
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Security & Verification
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Secure Payment</span>
                <span className="block text-violet-600 dark:text-violet-400">Verification</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Protect your business with instant payment verification and advanced fraud detection. 
                Know immediately when payments are real and when they're not.
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

        {/* Security Features Section */}
        <section className="py-20 bg-violet-50 dark:bg-violet-950/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                How We Protect Your Business
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                PXV Pay provides multiple layers of security to ensure every payment is legitimate
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
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

        {/* Protection Levels Section */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Multi-Layer Protection
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our security system works at multiple levels to ensure comprehensive protection
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {protectionLevels.map((level, index) => (
                <div 
                  key={index}
                  className="group text-center bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                      <level.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {level.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                      {level.description}
                    </p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {level.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Don't Handle Section */}
        <section className="py-20 bg-violet-50 dark:bg-violet-950/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                Transparent About Our Scope
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                PXV Pay focuses on payment verification and proof validation. We don't process money directly, 
                which means we don't handle chargebacks or card fraud detection. Our expertise is in ensuring 
                the payment proofs you receive are legitimate.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4">What We Do</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Instant payment verification</li>
                    <li>• Fake proof detection</li>
                    <li>• Transaction monitoring</li>
                    <li>• Real-time alerts</li>
                    <li>• Secure data handling</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4">What We Don't Handle</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Chargeback processing</li>
                    <li>• Card fraud detection</li>
                    <li>• Money processing</li>
                    <li>• Banking disputes</li>
                    <li>• Financial settlements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                Ready to secure your payments?
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Start protecting your business with instant payment verification and fraud detection.
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