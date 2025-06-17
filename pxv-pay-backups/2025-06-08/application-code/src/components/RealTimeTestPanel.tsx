'use client'

import { useState, useEffect } from 'react'
import { 
  subscribeToPaymentUpdates, 
  subscribeToNotifications, 
  subscribeToNewPayments,
  createTestPayment,
  updatePaymentStatus,
  TestPayment
} from '@/lib/test-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  description: string
  created_at: string
  read: boolean
  type: string
}

export function RealTimeTestPanel() {
  const [userPayments, setUserPayments] = useState<TestPayment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [merchantPayments, setMerchantPayments] = useState<TestPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<string>('')
  
  // Get the user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (data) {
          setRole(data.role)
        }
      }
    }
    
    fetchUserRole()
  }, [])
  
  // Set up subscriptions
  useEffect(() => {
    // Subscribe to payment updates for the current user
    const paymentUnsubscribe = subscribeToPaymentUpdates((payment) => {
      toast.success(`Payment status updated to: ${payment.status}`, {
        description: `Your payment of $${payment.amount} has been updated.`
      })
      
      setUserPayments(prev => [
        payment,
        ...prev.filter(p => p.id !== payment.id)
      ])
    })
    
    // Subscribe to notifications for the current user
    const notificationUnsubscribe = subscribeToNotifications((notification) => {
      toast.info(notification.title, {
        description: notification.description
      })
      
      setNotifications(prev => [notification, ...prev])
    })
    
    // Clean up subscriptions
    return () => {
      paymentUnsubscribe()
      notificationUnsubscribe()
    }
  }, [])
  
  // Set up merchant-specific subscription
  useEffect(() => {
    if (role === 'super_admin') {
      const merchantUnsubscribe = subscribeToNewPayments((payment) => {
        toast.info('New payment received', {
          description: `A new payment of $${payment.amount} is awaiting approval.`
        })
        
        setMerchantPayments(prev => [payment, ...prev])
      })
      
      return () => merchantUnsubscribe()
    }
  }, [role])
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const supabase = createClient()
      
      // Get user payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (paymentsData) {
        setUserPayments(paymentsData)
      }
      
      // Get notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (notificationsData) {
        setNotifications(notificationsData)
      }
    }
    
    fetchInitialData()
  }, [])
  
  // Create a test payment
  const handleCreatePayment = async () => {
    setLoading(true)
    try {
      const payment = await createTestPayment()
      if (payment) {
        toast.success('Test payment created', {
          description: `Created a test payment of $${payment.amount}.`
        })
      }
    } catch (error) {
      toast.error('Failed to create test payment')
    } finally {
      setLoading(false)
    }
  }
  
  // Update a payment status (for merchants)
  const handleUpdatePayment = async (paymentId: string, status: 'completed' | 'failed' | 'refunded') => {
    setLoading(true)
    try {
      const payment = await updatePaymentStatus(paymentId, status)
      if (payment) {
        toast.success(`Payment ${status}`, {
          description: `Payment ${paymentId} has been marked as ${status}.`
        })
      }
    } catch (error) {
      toast.error('Failed to update payment status')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Test Panel</CardTitle>
          <CardDescription>
            Test Supabase real-time functionality with payments and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">User Role: {role || 'Unknown'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {role === 'super_admin' 
                ? 'You have merchant admin permissions.' 
                : 'You are using the customer view.'}
            </p>
            
            <Button 
              onClick={handleCreatePayment}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Test Payment'}
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Payments */}
            <div>
              <h3 className="text-lg font-medium mb-2">Your Payments</h3>
              {userPayments.length > 0 ? (
                <div className="space-y-2">
                  {userPayments.map(payment => (
                    <div key={payment.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{payment.amount} {payment.currency || 'USD'}</span>
                        <span className={`text-sm ${
                          payment.status === 'completed' ? 'text-green-600' : 
                          payment.status === 'pending' ? 'text-yellow-600' : 
                          payment.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.payment_method} • {payment.reference_id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payments yet</p>
              )}
            </div>
            
            {/* Notifications */}
            <div>
              <h3 className="text-lg font-medium mb-2">Your Notifications</h3>
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div key={notification.id} className="border rounded-md p-3">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              )}
            </div>
          </div>
          
          {/* Merchant Section */}
          {role === 'super_admin' && (
            <div>
              <h3 className="text-lg font-medium border-t pt-4 mb-2">Merchant Controls</h3>
              <p className="text-sm text-muted-foreground mb-4">
                As a merchant, you can approve or reject pending payments.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium">Pending Payments</h4>
                {userPayments.filter(p => p.status === 'pending').length > 0 ? (
                  userPayments.filter(p => p.status === 'pending').map(payment => (
                    <div key={payment.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{payment.amount} {payment.currency || 'USD'}</span>
                        <span className="text-sm text-yellow-600">pending</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.payment_method} • {payment.reference_id}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(payment.created_at).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-600" 
                          onClick={() => handleUpdatePayment(payment.id, 'completed')}
                          disabled={loading}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-600"
                          onClick={() => handleUpdatePayment(payment.id, 'failed')}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No pending payments</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          This panel demonstrates real-time functionality between users and merchants.
        </CardFooter>
      </Card>
    </div>
  )
} 