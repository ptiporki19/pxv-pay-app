import React from 'react'
import { Separator } from '@/components/ui/separator'

const steps = [
  {
    number: '01',
    title: 'Configure Your Setup',
    description: 'Set up countries, currencies, and payment methods for your business using our intuitive admin dashboard.',
  },
  {
    number: '02',
    title: 'Create Payment Links',
    description: 'Generate dynamic payment links that you can share with your customers via email, invoice, or your website.',
  },
  {
    number: '03',
    title: 'Customers Make Payments',
    description: 'Customers use your branded checkout flow to select their preferred local payment method.',
  },
  {
    number: '04',
    title: 'Verify & Track Payments',
    description: 'Receive notifications, verify payment proofs, and track all transactions in your dashboard.',
  },
]

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            How PXV Pay Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our simple 4-step process makes global payment collection easy and efficient.
          </p>
          <Separator className="mt-8 max-w-md mx-auto bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="relative">
          {/* Connection line - subtle grayscale */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
          
          <div className="space-y-12 md:space-y-24 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
              >
                {/* Number */}
                <div className="relative flex-1 flex justify-center md:block">
                  <div className="w-16 h-16 rounded-full border-2 border-gray-900 dark:border-gray-100 bg-white dark:bg-black flex items-center justify-center relative z-10 shadow-sm">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{step.number}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center md:text-left max-w-md mx-auto md:mx-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks 