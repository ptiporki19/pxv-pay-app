import { Metadata } from 'next'

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Checkout Page Working!</h1>
      <p>Slug: {slug}</p>
      <p>✅ Route is functional</p>
    </div>
  )
} 