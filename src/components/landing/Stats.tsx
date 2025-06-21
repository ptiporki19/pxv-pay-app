'use client'

import React from 'react'
import { TrendingUp, Users, Globe, CreditCard, Clock, Shield, Gauge } from 'lucide-react'

const primaryStats = [
  {
    icon: Globe,
    title: "180+",
    description: "Countries Supported",
    metric: "Global reach"
  },
  {
    icon: CreditCard,
    title: "Unlimited",
    description: "Payment Methods",
    metric: "You configure them"
  },
  {
    icon: Clock,
    title: "24/7",
    description: "Customer Support",
    metric: "Always available"
  },
  {
    icon: Shield,
    title: "100%",
    description: "Secure Verification",
    metric: "Payment proof system"
  },
]

const performanceStats = [
  {
    icon: Gauge,
    title: "99.9%",
    description: "System Uptime",
    detail: "Reliable infrastructure"
  },
  {
    icon: Clock,
    title: "Instant",
    description: "Payment Verification",
    detail: "Real-time processing"
  },
  {
    icon: Shield,
    title: "Bank-Grade",
    description: "Security Standards",
    detail: "Advanced protection"
  },
]

const Stats = () => {
  return (
    <section className="py-32 bg-transparent dark:bg-transparent">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
            <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
            Built for Scale
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
            Everything you need for
            <span className="block text-violet-600 dark:text-violet-400">global payment success</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            PXV Pay provides the infrastructure and tools you need to accept payments from customers worldwide.
          </p>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {primaryStats.map((stat, index) => (
            <div 
              key={index}
              className="group text-center space-y-4 p-8 bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                <stat.icon className="w-8 h-8 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-black dark:text-white">
                  {stat.title}
                </div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {stat.description}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Performance Stats */}
        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4">
              Performance & Reliability
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Built with enterprise-grade infrastructure for maximum reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {performanceStats.map((stat, index) => (
              <div 
                key={index}
                className="group text-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-2xl hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-black dark:text-white">
                    {stat.title}
                  </div>
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    {stat.description}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.detail}
                  </div>
                </div>
              </div>
          ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
              Ready to join us?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start accepting global payments in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/signup" 
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
              >
                Start Free Trial
              </a>
              <a 
                href="/features" 
                className="px-8 py-4 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-semibold rounded-xl hover:bg-violet-200 dark:hover:bg-violet-800 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats 