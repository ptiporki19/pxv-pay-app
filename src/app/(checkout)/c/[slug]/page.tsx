import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckoutForm } from '@/components/checkout/checkout-form'

export const metadata: Metadata = {
  title: 'Complete Your Payment - PXV Pay',
  description: 'Secure payment processing',
}

interface CheckoutPageProps {
  params: { slug: string }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = params

  // Basic validation - detailed validation will be done in the component
  if (!slug || slug.length < 3) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CheckoutForm slug={slug} />
      </div>
    </div>
  )
} 