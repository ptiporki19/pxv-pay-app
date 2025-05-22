import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  ArrowRightLeft, 
  ShieldCheck, 
  BarChart2, 
  Paintbrush, 
  Zap 
} from 'lucide-react'

const features = [
  {
    icon: CreditCard,
    title: 'Global Payment Methods',
    description: 'Support diverse payment options from bank transfers to mobile money across countries and currencies.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Easy Integration',
    description: 'Simple setup with shareable payment links and a customizable checkout flow for your customers.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Transactions',
    description: 'Built with enterprise-grade security, ensuring all payment data is protected and compliant.'
  },
  {
    icon: BarChart2,
    title: 'Analytics Dashboard',
    description: 'Track payment activity with detailed analytics and insights to optimize your business.',
  },
  {
    icon: Paintbrush,
    title: 'Customization',
    description: 'Tailor the checkout experience with your branding, colors, and content to match your identity.',
  },
  {
    icon: Zap,
    title: 'Fast Setup',
    description: 'Get up and running quickly with a guided setup wizard and intuitive configuration tools.',
  },
]

const Features = () => {
  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Powerful Features for Global Payments
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            PXV Pay provides everything you need to collect payments globally with local methods, all in one platform.
          </p>
          <Separator className="mt-8 max-w-md mx-auto bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-black">
              <CardHeader>
                <div className="mb-4 text-gray-900 dark:text-gray-100">
                  <feature.icon className="h-10 w-10" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features 