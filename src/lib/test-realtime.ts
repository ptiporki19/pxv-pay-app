/**
 * Utility functions to test real-time functionality with Supabase
 * This can be used in development to validate that real-time subscriptions are working
 */

import { createClient } from '@/lib/supabase/client'

export interface TestPayment {
  id: string
  amount: string
  payment_method: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  reference_id: string
}

/**
 * Subscribe to payment changes for the current user
 * @param onPaymentUpdate Callback function when a payment is updated
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToPaymentUpdates(
  onPaymentUpdate: (payment: TestPayment) => void
) {
  const supabase = createClient()
  
  console.log('Setting up payment subscription...')
  
  // Get current user
  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id
  }
  
  let paymentSubscription: any = null
  
  // Set up subscription
  const setupSubscription = async () => {
    const userId = await getCurrentUser()
    
    if (!userId) {
      console.warn('No authenticated user found for payment subscription')
      return
    }
    
    paymentSubscription = supabase
      .channel('payment-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Payment updated:', payload)
        onPaymentUpdate(payload.new as TestPayment)
      })
      .subscribe((status) => {
        console.log('Payment subscription status:', status)
      })
  }
  
  setupSubscription()
  
  // Return cleanup function
  return () => {
    if (paymentSubscription) {
      supabase.removeChannel(paymentSubscription)
    }
  }
}

/**
 * Subscribe to notifications for the current user
 * @param onNotification Callback function when a notification is received
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToNotifications(
  onNotification: (notification: any) => void
) {
  const supabase = createClient()
  
  console.log('Setting up notification subscription...')
  
  // Get current user
  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id
  }
  
  let notificationSubscription: any = null
  
  // Set up subscription
  const setupSubscription = async () => {
    const userId = await getCurrentUser()
    
    if (!userId) {
      console.warn('No authenticated user found for notification subscription')
      return
    }
    
    notificationSubscription = supabase
      .channel('notification-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('New notification:', payload)
        onNotification(payload.new)
      })
      .subscribe((status) => {
        console.log('Notification subscription status:', status)
      })
  }
  
  setupSubscription()
  
  // Return cleanup function
  return () => {
    if (notificationSubscription) {
      supabase.removeChannel(notificationSubscription)
    }
  }
}

/**
 * For merchants: Subscribe to all new payments
 * @param onNewPayment Callback function when a new payment is created
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToNewPayments(
  onNewPayment: (payment: TestPayment) => void
) {
  const supabase = createClient()
  
  console.log('Setting up new payment subscription for merchant...')
  
  const paymentSubscription = supabase
    .channel('merchant-payment-updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'payments'
    }, (payload) => {
      console.log('New payment received:', payload)
      onNewPayment(payload.new as TestPayment)
    })
    .subscribe((status) => {
      console.log('Merchant payment subscription status:', status)
    })
  
  // Return cleanup function
  return () => {
    supabase.removeChannel(paymentSubscription)
  }
}

/**
 * For testing: Create a test payment to simulate a user making a payment
 * This would normally happen through the checkout flow, but this is for testing
 */
export async function createTestPayment() {
  const supabase = createClient()
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  
  if (!userId) {
    console.error('No authenticated user found')
    return null
  }
  
  // Create a test payment
  const { data, error } = await supabase
    .from('payments')
    .insert({
      amount: (Math.random() * 1000).toFixed(2),
      payment_method: 'Test Payment',
      status: 'pending',
      user_id: userId,
      reference_id: `TEST-${Math.floor(Math.random() * 1000000)}`,
      notes: 'Test payment from the client'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating test payment:', error)
    return null
  }
  
  console.log('Test payment created:', data)
  return data
}

/**
 * For merchant testing: Update a payment status
 * This simulates a merchant approving or rejecting a payment
 */
export async function updatePaymentStatus(
  paymentId: string, 
  status: 'completed' | 'failed' | 'refunded'
) {
  const supabase = createClient()
  
  // Update the payment status
  const { data, error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', paymentId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating payment status:', error)
    return null
  }
  
  console.log(`Payment ${paymentId} updated to ${status}:`, data)
  return data
} 