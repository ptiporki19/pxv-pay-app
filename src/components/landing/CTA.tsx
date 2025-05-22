import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const CTA = () => {
  return (
    <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gray-100 dark:bg-gray-900 rounded-2xl p-8 md:p-16 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Ready to Streamline Your Global Payments?
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Join thousands of businesses using PXV Pay to collect payments globally with local methods. Start accepting payments in minutes.
              </p>

              <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full md:w-auto border border-gray-900 dark:border-gray-100 rounded hover:bg-gray-200 hover:dark:bg-gray-800">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full md:w-auto border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 hover:dark:bg-gray-800">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="aspect-square bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-8 relative shadow-sm">
                {/* Abstract monochrome pattern or visual */}
                <div className="absolute inset-0 p-8">
                  <div className="h-full w-full border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-lg grid place-items-center">
                    <span className="text-gray-500 dark:text-gray-400 text-center">
                      Start accepting payments<br/>in 150+ countries
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA 