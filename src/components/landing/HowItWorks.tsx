import React from 'react'
import { Settings, Link2, ShoppingCart, CheckCircle, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Settings,
    number: '01',
    title: 'Set Up Payment Methods',
    description: 'Configure your preferred payment methods through our intuitive admin dashboard. Connect with your chosen payment processors and set up local payment options.',
    highlight: 'Easy Setup'
  },
  {
    icon: Link2,
    number: '02',
    title: 'Create Checkout Links',
    description: 'Generate branded checkout links that you can share via email, invoices, or embed directly on your website.',
    highlight: 'Instant Generation'
  },
  {
    icon: ShoppingCart,
    number: '03',
    title: 'Open for Business',
    description: 'Your payment infrastructure is ready! Accept payments for products, services, or simple one-time checkouts globally.',
    highlight: 'Ready to Go'
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Get Paid Instantly',
    description: 'Receive real-time notifications and instant settlement. Track all transactions in your comprehensive dashboard.',
    highlight: 'Real-time'
  },
]

const HowItWorks = () => {
  return (
    <section className="py-32 bg-transparent dark:bg-transparent">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
            <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
            Simple Process
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
            How PXV Pay
            <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">makes it simple</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            From setup to payment collection, our streamlined process gets you accepting global payments in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
        <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-16 bottom-16 w-px bg-violet-200 dark:bg-violet-800 hidden md:block" />
          
            <div className="space-y-16">
            {steps.map((step, index) => (
              <div 
                key={index} 
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16 relative`}
              >
                  {/* Icon and Number */}
                  <div className="relative flex items-center justify-center md:flex-1 md:justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl flex items-center justify-center relative z-10 transition-transform duration-300 hover:scale-110 shadow-lg shadow-violet-500/25">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-violet-100 dark:bg-violet-900 border-2 border-white dark:border-black rounded-lg flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 z-20">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-center md:text-left max-w-lg space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                        {step.title}
                      </h3>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                        {step.highlight}
                  </div>
                </div>
                
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
              Ready to get started?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Join thousands of businesses already using PXV Pay to accept global payments
            </p>
              </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/signup" 
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 group"
            >
              Start Free Trial
              <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a 
              href="/features" 
              className="px-8 py-4 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-semibold rounded-xl hover:bg-violet-200 dark:hover:bg-violet-800 transition-all duration-300"
            >
              See Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks 