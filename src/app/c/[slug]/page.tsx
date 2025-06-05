import { Metadata } from 'next'
import { ModernCheckoutForm } from '@/components/checkout/modern-checkout-form'

export const metadata: Metadata = {
  title: 'Complete Your Payment - PXV Pay',
  description: 'Secure payment processing',
}

interface CheckoutPageProps {
  params: { slug: string }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernCheckoutForm slug={slug} />
    </div>
  )
} 