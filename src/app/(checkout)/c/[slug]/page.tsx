import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

  // Basic validation - detailed validation will be done in the component
  if (!slug || slug.length < 3) {
    notFound()
  }

  return <ModernCheckoutForm slug={slug} />
} 