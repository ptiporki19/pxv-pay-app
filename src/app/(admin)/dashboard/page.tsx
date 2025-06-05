import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { 
  ExternalLink,
  Info,
  CreditCard
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { 
  PendingVerificationWidget,
  PaymentMethodsWidget,
  CurrenciesWidget,
  TotalPaymentsWidget,
  ProductsWidget
} from '@/components/dashboard/merchant-stats-widgets'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const metadata: Metadata = {
  title: 'Dashboard - PXV Pay',
  description: 'Your payment system dashboard',
}

interface PaymentStatus {
  [key: string]: 'pending' | 'completed' | 'failed' | 'refunded'
}

export default async function DashboardPage() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Default values in case fetch fails
  let session = null
  let userData = null
  let formattedPayments: any[] = []
  
  try {
    // Get user session and profile
    const { data } = await supabase.auth.getSession()
    session = data.session
    const userId = session?.user?.id
    
    if (userId) {
      // Fetch user data
      const { data: userResult } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      userData = userResult

      // Check if user is super admin
      const isSuperAdmin = userData?.role === 'super_admin' || 
        session?.user?.email === 'admin@pxvpay.com' || 
        session?.user?.email === 'dev-admin@pxvpay.com' || 
        session?.user?.email === 'superadmin@pxvpay.com'
      
      // Build payments query based on user role
      let paymentsQuery = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // If not super admin, filter by merchant_id to show only their own transactions
      if (!isSuperAdmin) {
        paymentsQuery = paymentsQuery.eq('merchant_id', userId)
      }

      const { data: recentPayments } = await paymentsQuery
      
      // Format payment data using the same logic as super admin dashboard
      formattedPayments = recentPayments?.map(payment => ({
        id: payment.id || 'N/A',
        fullId: payment.id || 'N/A',
        date: payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        customer: payment.customer_name || payment.customer_email?.split('@')[0] || 'N/A',
        customerEmail: payment.customer_email || '',
        amount: payment.amount && payment.currency ? payment.amount : 0,
        currency: payment.currency || 'USD',
        method: payment.payment_method || 'N/A',
        country: payment.country || 'N/A',
        status: payment.status || 'pending'
      })) || []
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    // The default values set at the beginning will be used
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with welcome message and recent activity button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData?.email?.split('@')[0] || 'User'}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/transactions">
            <ExternalLink className="h-4 w-4" />
            View Recent Activity
          </Link>
        </Button>
      </div>

      {/* Payment Management Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payments</CardTitle>
          </div>
          <CardDescription>Manage your payments</CardDescription>
              </CardHeader>
        <CardContent className="text-sm pb-3">
          <p>View transactions and verify pending payments.</p>
              </CardContent>
            </Card>

      {/* Real-Time Dashboard Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dashboard Stats</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <PendingVerificationWidget />
          <PaymentMethodsWidget />
          <CurrenciesWidget />
          <TotalPaymentsWidget />
          <ProductsWidget />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Real-time data updates automatically when changes are made
        </p>
      </div>

      {/* Payment History */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Payment History</h2>
            <p className="text-sm text-muted-foreground">
              View all payment transactions and their status
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/transactions">
              <ExternalLink className="h-4 w-4" />
              View All Transactions
            </Link>
          </Button>
        </div>

        <div className="rounded-md border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-background dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Method</th>
                  <th className="px-4 py-3 text-left font-medium">Country</th>
                  <th className="px-4 py-3 text-left font-medium">View / Status</th>
                </tr>
              </thead>
              <tbody>
                {formattedPayments.length > 0 ? (
                  formattedPayments.map((payment) => (
                    <tr key={payment.fullId} className="border-b transition-colors hover:bg-background dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">{payment.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">{payment.date}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{payment.customer}</div>
                        <div className="text-xs text-muted-foreground">{payment.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{payment.amount} {payment.currency}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                      <td className="px-4 py-3">{payment.country}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {/* Transaction Details Dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Info className="h-4 w-4" />
                                <span className="sr-only">View Transaction Details</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for transaction {payment.id.slice(0, 8)}...
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-6">
                                {/* Transaction Info */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <h3 className="font-semibold mb-3">Transaction Information</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Transaction ID:</span>
                                      <div className="font-mono text-xs">{payment.fullId}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Amount:</span>
                                      <div className="text-lg font-semibold">{payment.amount} {payment.currency}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Customer:</span>
                                      <div>{payment.customer}</div>
                                      <div className="text-gray-600">{payment.customerEmail}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Payment Method:</span>
                                      <div>{payment.method}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Country:</span>
                                      <div>{payment.country}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Date:</span>
                                      <div>{payment.date}</div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Status:</span>
                                      <div>
                                        <Badge variant="outline" className={cn(
                                          payment.status === 'completed' && "bg-green-50 text-green-700 border-green-200",
                                          payment.status === 'pending_verification' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                          payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                          payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200"
                                        )}>
                                          {payment.status.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Link to full transaction details */}
                                <div className="flex justify-center">
                                  <Button asChild>
                                    <Link href={`/transactions/${payment.fullId}`}>
                                      View Full Transaction Details
                                      <ExternalLink className="h-4 w-4 ml-2" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Badge variant="outline" className={cn(
                            payment.status === 'completed' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                            payment.status === 'pending_verification' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                            payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                            payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          )}>
                            {payment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {userData ? 'No payments found. Payments will appear here once processed.' : 'Loading payment history...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 