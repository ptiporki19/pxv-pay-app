import React from 'react'
import { Quote, Star, ArrowRight } from 'lucide-react'

const testimonials = [
  {
    quote: "Setting up payment collection for my business was so simple with PXV Pay. I can now accept payments from customers across Africa and beyond. The setup took just a few minutes.",
    author: "Kwame Asante",
    position: "Business Owner",
    company: "Asante Trading Co.",
    rating: 5,
    metric: "Quick setup"
  },
  {
    quote: "The payment verification feature is amazing. I can instantly confirm when my customers have paid, which helps me process orders faster and avoid disputes.",
    author: "Amara Diallo",
    position: "Founder",
    company: "Diallo Fashion",
    rating: 5,
    metric: "Instant verification"
  },
  {
    quote: "As a small business, I appreciate how easy it is to customize my payment methods. I can add the local payment options my customers prefer most.",
    author: "Chinedu Okafor",
    position: "Managing Director",
    company: "Okafor Electronics",
    rating: 5,
    metric: "Easy customization"
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
            Customer Stories
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
            Trusted by businesses
            <span className="block text-violet-600 dark:text-violet-400">across Africa and beyond</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            See how businesses use PXV Pay to streamline their payment operations and grow their customer base.
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Support Available
              </div>
            </div>
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                180+
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Countries Supported
              </div>
            </div>
            <div className="space-y-2 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-2xl">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                Unlimited
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Payment Methods
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-8">
            <div className="inline-flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <span className="text-lg font-medium">Ready to join us?</span>
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