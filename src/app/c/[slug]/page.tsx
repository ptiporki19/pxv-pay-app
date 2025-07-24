import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CheckoutPageClient } from './checkout-client'
import { getDeviceType } from '@/lib/utils/device-detection'

export const metadata: Metadata = {
  title: 'Complete Your Payment - PXV Pay',
  description: 'Secure payment processing',
}

interface CheckoutPageProps {
  params: { slug: string }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // Redirect mobile users to mobile version
  if (getDeviceType(userAgent) === 'mobile') {
    redirect(`/c/m/${slug}`)
  }

  return <CheckoutPageClient slug={slug} />
}