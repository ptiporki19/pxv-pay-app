import { Metadata } from 'next'
import { CheckoutPageClient } from '../../c/[slug]/checkout-client'

export const metadata: Metadata = {
  title: 'Complete Your Payment - PXV Pay',
  description: 'Secure payment processing',
}

interface CheckoutPageProps {
  params: { slug: string }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params

  return <CheckoutPageClient slug={slug} />
} 