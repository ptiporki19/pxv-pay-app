import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Make a Payment - PXV Pay',
  description: 'Secure payment processing',
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { amount?: string; currency?: string; merchant_id?: string }
}) {
  const supabase = createClient()
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  // If not logged in, store the payment info in the session and redirect to login
  if (!session) {
    redirect('/signin?redirect=/pay' + 
      (searchParams.amount ? `&amount=${searchParams.amount}` : '') +
      (searchParams.currency ? `&currency=${searchParams.currency}` : '') +
      (searchParams.merchant_id ? `&merchant_id=${searchParams.merchant_id}` : '')
    )
  }
  
  // Get amount from query params or use default
  const amount = searchParams.amount || '100.00'
  const currency = searchParams.currency || 'USD'
  const merchantId = searchParams.merchant_id

  // Fetch available countries from the database
  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true })

  // Handle form submission
  async function handlePaymentSubmit(formData: FormData) {
    'use server'
    
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/signin?redirect=/pay')
    }
    
    const paymentData = {
      user_id: session.user.id,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string,
      country: formData.get('country') as string,
      status: 'pending',
      merchant_id: formData.get('merchant_id') as string || null,
      payment_method: 'manual',
      description: 'Payment from checkout flow',
      created_at: new Date().toISOString(),
    }
    
    // Insert the payment into the database
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
    
    if (error) {
      console.error('Payment creation error:', error)
      redirect('/pay?error=payment_failed')
    }
    
    // Redirect to the payment confirmation page
    if (data && data[0]) {
      redirect(`/payment-confirmation/${data[0].id}`)
    } else {
      redirect('/pay?error=payment_failed')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Payment Details</h1>
        <p className="text-gray-500 mt-2">Please enter your payment information</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form action={handlePaymentSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                id="amount"
                name="amount"
                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md"
                defaultValue={amount}
                readOnly={!!searchParams.amount}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{currency}</span>
              </div>
            </div>
          </div>
          
          <input type="hidden" name="currency" value={currency} />
          {merchantId && <input type="hidden" name="merchant_id" value={merchantId} />}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md"
              placeholder="John Doe"
              defaultValue={session?.user?.user_metadata?.full_name || ''}
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a country</option>
              {countries && countries.map((country) => (
                <option key={country.id} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-4"
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
} 