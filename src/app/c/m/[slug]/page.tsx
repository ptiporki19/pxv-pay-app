import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { MobileCheckoutClient } from './mobile-checkout-client'
import { getDeviceType } from '@/lib/utils/device-detection'

export const metadata: Metadata = {
  title: 'Complete Your Payment - Mobile',
  description: 'Secure mobile payment processing',
}

interface MobileCheckoutPageProps {
  params: { slug: string }
}

export default async function MobileCheckoutPage({ params }: MobileCheckoutPageProps) {
  const { slug } = await params
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // Redirect desktop users to desktop version
  if (getDeviceType(userAgent) === 'desktop') {
    redirect(`/c/${slug}`)
  }

  return <MobileCheckoutClient slug={slug} />
}