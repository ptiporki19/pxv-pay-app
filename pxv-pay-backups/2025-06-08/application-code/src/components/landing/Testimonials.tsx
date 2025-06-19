import React from 'react'
import { Quote, Star, ArrowRight } from 'lucide-react'

const testimonials = [
  {
    quote: "PXV Pay eliminated the complexity of global payments. We went from months of setup to accepting payments worldwide in just hours. The local payment method integration boosted our conversion by 40%.",
    author: "Sarah Chen",
    position: "CFO",
    company: "TechFlow Solutions",
    rating: 5,
    metric: "+40% conversion"
  },
  {
    quote: "The simplicity is remarkable. Set up payment methods, create checkout links, and we're instantly global. No country configurations, no technical headaches. Just seamless payment collection.",
    author: "Michael Rodriguez",
    position: "Founder",
    company: "Novus Commerce",
    rating: 5,
    metric: "5-minute setup"
  },
  {
    quote: "Real-time settlement changed our cash flow completely. Instead of waiting days, we get paid instantly. The analytics dashboard gives us insights we never had access to before.",
    author: "Aisha Johnson",
    position: "Head of Finance",
    company: "Global Ventures",
    rating: 5,
    metric: "Instant settlement"
  },
]

const Testimonials = () => {
  return (
    <section className="py-32 bg-transparent dark:bg-transparent">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
            <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
            Client Success
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
            Trusted by businesses
            <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">around the world</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            See how companies of all sizes use PXV Pay to streamline their global payment operations and accelerate growth.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group bg-white dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Quote icon */}
              <div className="mb-6">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300">
                  <Quote className="w-6 h-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 fill-current text-violet-400" 
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 text-lg">
                  "{testimonial.quote}"
              </blockquote>

              {/* Metric highlight */}
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                  {testimonial.metric}
                </span>
              </div>

              {/* Author */}
              <div className="space-y-1">
                <div className="font-bold text-black dark:text-white text-lg">
                  {testimonial.author}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {testimonial.position}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {testimonial.company}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Social proof stats */}
        <div className="text-center space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                1,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Happy Clients
              </div>
            </div>
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                $1.2B+
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Processed
              </div>
            </div>
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                99.99%
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Uptime
              </div>
            </div>
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                180+
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Countries
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-8">
            <div className="inline-flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <span className="text-lg font-medium">Ready to join them?</span>
              <div className="w-16 h-px bg-violet-300 dark:bg-violet-700" />
              <a 
                href="/signup" 
                className="text-lg font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-300 group"
              >
                Start your free trial
                <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials 