'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  ShieldCheck, 
  Lock,
  Eye,
  Key,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Zap,
  AlertTriangle,
  FileCheck,
  Globe
} from 'lucide-react'

const securityFeatures = [
  {
    icon: Eye,
    title: 'Instant Payment Verification',
    description: 'Users can verify payments instantly with real-time confirmation and immediate proof of payment for every transaction.',
    features: [
      'Instant payment confirmation',
      'Real-time verification status',
      'Digital payment receipts',
      'Transaction proof generation'
    ]
  },
  {
    icon: CheckCircle,
    title: 'Complete Payment Proof',
    description: 'Every transaction generates comprehensive proof that users can access, download, and share for verification purposes.',
    features: [
      'Digital transaction records',
      'Downloadable payment proof',
      'Shareable verification links',
      'Audit trail maintenance'
    ]
  },
  {
    icon: ShieldCheck,
    title: 'Secure Processing',
    description: 'Industry-leading security standards ensure all payments are processed safely with PCI DSS Level 1 compliance.',
    features: [
      'PCI DSS Level 1 certified',
      'End-to-end encryption',
      'Secure data handling',
      'Regular security audits'
    ]
  },
  {
    icon: Lock,
    title: 'Fraud Protection',
    description: 'Advanced fraud detection protects both merchants and customers with real-time monitoring and prevention systems.',
    features: [
      'Real-time fraud detection',
      'Suspicious activity alerts',
      'Transaction monitoring',
      'Risk assessment scoring'
    ]
  }
]

const compliance = [
  {
    standard: 'PCI DSS Level 1',
    description: 'Payment Card Industry Data Security Standard',
    details: 'Highest level of PCI compliance for organizations processing over 6 million card transactions annually.',
    icon: ShieldCheck
  },
  {
    standard: 'ISO 27001',
    description: 'Information Security Management System',
    details: 'International standard for information security management systems and risk management.',
    icon: FileCheck
  },
  {
    standard: 'SOC 2 Type II',
    description: 'Service Organization Control 2',
    details: 'Independent audit of security, availability, processing integrity, confidentiality, and privacy.',
    icon: Eye
  },
  {
    standard: 'GDPR',
    description: 'General Data Protection Regulation',
    details: 'European Union regulation for data protection and privacy with global implications.',
    icon: Globe
  }
]

const threatProtection = [
  {
    threat: 'Card Testing',
    protection: 'Rate limiting and pattern detection',
    description: 'Prevent fraudsters from testing stolen card data through small transactions.'
  },
  {
    threat: 'Account Takeover',
    protection: 'Behavioral analysis and device fingerprinting',
    description: 'Detect unusual login patterns and unauthorized account access attempts.'
  },
  {
    threat: 'Transaction Laundering',
    protection: 'Transaction monitoring and reporting',
    description: 'Identify suspicious transaction patterns and comply with anti-money laundering regulations.'
  },
  {
    threat: 'Chargeback Fraud',
    protection: 'Intelligent dispute management',
    description: 'Automated evidence collection and response to reduce false chargebacks.'
  }
]

const securityMetrics = [
  {
    metric: 'Instant',
    label: 'Payment Verification',
    description: 'Immediate payment confirmation'
  },
  {
    metric: '100%',
    label: 'Payment Proof',
    description: 'Complete transaction records'
  },
  {
    metric: '<1s',
    label: 'Processing Time',
    description: 'Real-time payment processing'
  },
  {
    metric: '24/7',
    label: 'Availability',
    description: 'Always available verification'
  }
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
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
              <Link href="/features" className="hover:text-black dark:hover:text-white transition-colors duration-300 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Features
              </Link>
              <span>/</span>
              <span className="text-black dark:text-white">Security</span>
            </div>
            
            <div className="text-center space-y-8 mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Instant Verification & Proof
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Instant payments</span>
                <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">with proof you can trust</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Users can verify payments instantly and view proof of payment in real-time. 
                Every transaction is processed immediately with instant confirmation and secure verification.
              </p>
            </div>
          </div>
        </section>

        {/* Security Metrics */}
        <section className="py-12 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {securityMetrics.map((metric, index) => (
                <div key={index} className="text-center space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
                  <div className="text-3xl md:text-4xl font-bold text-violet-600 dark:text-violet-400">
                    {metric.metric}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {metric.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Multi-Layer Security
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Comprehensive protection at every level of your payment infrastructure
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-violet-50 dark:bg-violet-950/30 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="space-y-6">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        {feature.title}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      {feature.features.map((item, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Industry Compliance
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Meeting the highest standards for security and data protection
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {compliance.map((item, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 p-6 bg-white dark:bg-gray-900 rounded-2xl hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {item.standard}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Threat Protection */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Advanced Threat Protection
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Proactive defense against sophisticated payment fraud and cyber threats
              </p>
            </div>
            
            <div className="space-y-6">
              {threatProtection.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-black dark:text-white">{item.threat}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Threat Type</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-black dark:text-white">{item.protection}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Protection Method</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
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
                Security you can trust
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Protect your business with enterprise-grade security. Start accepting payments with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                    Get Secure Payments
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