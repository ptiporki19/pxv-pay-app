import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QuoteIcon } from 'lucide-react'

const testimonials = [
  {
    quote: "PXV Pay transformed how we collect payments across Europe and Asia. The local payment methods integration was seamless and boosted our conversion rates by 35%.",
    author: "Sarah Chen",
    position: "CFO, TechGlobal Inc.",
    company: "TechGlobal Inc."
  },
  {
    quote: "Setting up our payment infrastructure used to take months. With PXV Pay, we were fully operational in just days, supporting payment methods we couldn't before.",
    author: "Michael Rodriguez",
    position: "Head of Finance",
    company: "Novus Retail"
  },
  {
    quote: "The analytics dashboard gives us insights we never had access to before. We can now see which payment methods perform best in each market.",
    author: "Aisha Johnson",
    position: "Director of Operations",
    company: "Streamline Solutions"
  },
]

const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trusted by businesses worldwide to handle their global payment needs.
          </p>
          <Separator className="mt-8 max-w-md mx-auto bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-black hover:shadow-md transition-shadow">
              <CardHeader className="pb-0">
                <QuoteIcon className="h-8 w-8 text-gray-300 dark:text-gray-700" />
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.quote}"
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="w-8 h-px bg-gray-300 dark:bg-gray-700 mb-4"></div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.author}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.position}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials 