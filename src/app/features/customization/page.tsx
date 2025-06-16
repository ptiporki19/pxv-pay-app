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
  Settings, 
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  Layout,
  Brush,
  Target
} from 'lucide-react'

const customizationFeatures = [
  {
    icon: ShoppingBag,
    title: 'Product Customization',
    description: 'Configure your products for different use cases. Whether you\'re selling physical goods, digital products, or services, customize the checkout experience for each product type.',
    benefits: ['Product-specific settings', 'Multiple product types', 'Flexible configurations']
  },
  {
    icon: Palette,
    title: 'Brand Matching',
    description: 'Make your payment experience match your brand. Customize colors, styling, and visual elements to create a cohesive experience for your customers.',
    benefits: ['Custom colors', 'Brand styling', 'Visual consistency']
  },
  {
    icon: Layout,
    title: 'Checkout Flow Design',
    description: 'Design checkout flows that work for your business model. Create different flows for different products or customer types to optimize conversions.',
    benefits: ['Custom flows', 'Multiple layouts', 'Conversion optimization']
  },
  {
    icon: Settings,
    title: 'Payment Method Configuration',
    description: 'Configure which payment methods to offer for different products or regions. Give your customers the payment options they prefer most.',
    benefits: ['Method selection', 'Regional preferences', 'Customer choice']
  },
]

const customizationTypes = [
  {
    icon: Brush,
    title: 'Visual Customization',
    description: 'Make it look like your brand',
    features: ['Custom colors and themes', 'Logo placement', 'Typography choices', 'Layout preferences']
  },
  {
    icon: Target,
    title: 'Functional Customization',
    description: 'Make it work for your business',
    features: ['Product configurations', 'Payment method selection', 'Checkout flow design', 'Customer experience']
  },
  {
    icon: Settings,
    title: 'Business Logic',
    description: 'Adapt to your business model',
    features: ['Different product types', 'Pricing strategies', 'Customer segments', 'Regional settings']
  },
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
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
                <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
                Customization
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight">
                <span className="block">Make It</span>
                <span className="block text-violet-600 dark:text-violet-400">Your Own</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Customize your payment experience to match your brand and business needs. 
                From visual styling to product configurations, make PXV Pay work exactly how you want it.
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

        {/* Customization Features Section */}
        <section className="py-20 bg-violet-50 dark:bg-violet-950/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                What You Can Customize
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                PXV Pay gives you control over every aspect of your payment experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {customizationFeatures.map((feature, index) => (
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

        {/* Customization Types Section */}
        <section className="py-20 bg-transparent dark:bg-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Three Levels of Customization
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                From visual styling to business logic, customize at the level that makes sense for your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {customizationTypes.map((type, index) => (
                <div 
                  key={index}
                  className="group text-center bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                      <type.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {type.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                      {type.description}
                    </p>
                    
                    <div className="space-y-2">
                      {type.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-500 dark:text-gray-400 justify-center">
                          <CheckCircle className="w-3 h-3 text-violet-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-violet-50 dark:bg-violet-950/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                  Real Customization Examples
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  See how different businesses use PXV Pay's customization features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-left">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4">E-commerce Store</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    "We customized our checkout to match our brand colors and created different flows for digital vs physical products."
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li>• Brand color matching</li>
                    <li>• Product-specific flows</li>
                    <li>• Regional payment methods</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-left">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4">Service Business</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    "We configured different payment options for consultations vs project work, making it easier for clients to pay."
                  </p>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li>• Service-specific configurations</li>
                    <li>• Custom pricing displays</li>
                    <li>• Client-friendly flows</li>
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
                Ready to make it your own?
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Start customizing your payment experience to match your brand and business needs.
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