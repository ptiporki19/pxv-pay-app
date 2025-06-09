import React from 'react'
import { 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  BarChart3, 
  Palette, 
  Zap,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Global Payment Methods',
    description: 'Accept payments in 180+ countries with local payment methods. From credit cards to mobile money, we support them all.',
    highlight: '180+ Countries'
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Get your money immediately after transactions. No more waiting 2-5 business days for settlement.',
    highlight: 'Real-time'
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description: 'PCI DSS Level 1 compliant with advanced fraud protection and encryption for all transactions.',
    highlight: 'PCI Compliant'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights into payment performance, conversion rates, and customer behavior with real-time dashboards.',
    highlight: 'Real-time Data'
  },
  {
    icon: Palette,
    title: 'Full Customization',
    description: 'Tailor the entire payment experience to match your brand with custom checkout flows and UI.',
    highlight: 'Your Brand'
  },
  {
    icon: CreditCard,
    title: 'Developer API',
    description: 'Comprehensive REST API with SDKs and webhooks for seamless integration. Coming soon to enhance your development experience.',
    highlight: 'Coming Soon'
  },
]

const Features = () => {
  return (
    <section className="py-32 bg-transparent dark:bg-transparent">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
            <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
            Powerful Features
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
            Everything you need for
            <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">global payments</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            PXV Pay provides a complete payment infrastructure that scales with your business, from startups to enterprise.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-7 h-7 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-black dark:text-white">
                    {feature.title}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                    {feature.highlight}
                  </span>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <span className="text-lg font-medium">Ready to get started?</span>
            <div className="w-16 h-px bg-violet-300 dark:bg-violet-700" />
            <a 
              href="/signup" 
              className="text-lg font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-300 group"
            >
              Create your account
              <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features 