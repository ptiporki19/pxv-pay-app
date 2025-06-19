import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { 
  ArrowTopRightOnSquareIcon as ExternalLink,
  InformationCircleIcon as InfoIcon,
  PlusIcon as Plus,
  CreditCardIcon
} from '@heroicons/react/24/solid'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { 
  PendingVerificationWidget,
  PaymentMethodsWidget,
  TotalPaymentsWidget,
  ProductsWidget
} from '@/components/dashboard/merchant-stats-widgets'


export const metadata: Metadata = {
  title: 'Dashboard - PXV Pay',
  description: 'Your payment system dashboard',
}

interface PaymentStatus {
  [key: string]: 'pending' | 'completed' | 'failed' | 'refunded'
}

export default async function DashboardPage() {
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    
    // Default values in case fetch fails
    let session = null
    let userData = null
    let formattedPayments: any[] = []
    let paymentsError = null
    
    // Get user session and profile
    const { data, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-600">{sessionError.message}</p>
        </div>
      )
    }
    
    session = data.session
    
    if (!session) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-bold text-gray-600">Not Authenticated</h2>
          <p className="text-gray-600">Please sign in to access the dashboard</p>
        </div>
      )
    }
    
    const userId = session?.user?.id
    
    if (userId) {
      // Fetch user data using email for reliable lookup
      const { data: userResult, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session?.user?.email)
        .single()
      
      if (userError) {
        console.error('User profile error:', userError)
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <h2 className="text-xl font-bold text-red-600">Profile Error</h2>
            <p className="text-gray-600">Error loading user profile: {userError.message}</p>
            <p className="text-sm text-gray-500">User ID: {session.user.id}</p>
            <p className="text-sm text-gray-500">Email: {session.user.email}</p>
          </div>
        )
      }
      
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

      // If not super admin, filter by merchant_id using the correct database ID
      if (!isSuperAdmin && userData?.id) {
        paymentsQuery = paymentsQuery.eq('merchant_id', userData.id)
      }

      const { data: recentPayments, error: paymentsFetchError } = await paymentsQuery
      
      if (paymentsFetchError) {
        console.error('Payments fetch error:', paymentsFetchError)
        paymentsError = paymentsFetchError
      }
      
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

  return (
    <div className="flex flex-col gap-8">
      {/* Professional Hero Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gray-900 dark:text-white font-geist">Payment Control Center</h1>
          <p className="text-lg lg:text-xl font-medium text-gray-600 dark:text-gray-300 leading-relaxed font-geist mt-2">
            Welcome back, <span className="font-bold text-violet-600 dark:text-violet-400">{userData?.email?.split('@')[0] || 'User'}</span>
          </p>
        </div>
      </div>

      {/* Performance Metrics with aligned button */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">Performance Metrics</h2>
          <Button size="lg" className="gap-2 font-bold violet-gradient hover:violet-gradient-hover font-geist" asChild>
          <Link href="/checkout-links/create">
            <Plus className="h-5 w-5" />
            Create Checkout Link
          </Link>
        </Button>
      </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <PendingVerificationWidget />
          <PaymentMethodsWidget />
          <TotalPaymentsWidget />
          <ProductsWidget />
        </div>
      </div>

      {/* Payment History */}
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">Transaction History</h2>
            <p className="text-base font-medium text-gray-600 dark:text-gray-300 mt-1 font-geist">
              Monitor all payment transactions and their status
            </p>
          </div>
          <Button variant="outline" size="default" className="gap-2 font-bold font-geist" asChild>
            <Link href="/transactions">
              <ExternalLink className="h-4 w-4" />
              View All Transactions
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <div className="border rounded-lg">
              {/* Table Header */}
              <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist font-semibold text-sm">
                <div className="w-[120px]">Transaction ID</div>
                <div className="w-[100px]">Date</div>
                <div className="w-[160px]">Customer</div>
                <div className="w-[100px]">Amount</div>
                <div className="w-[120px]">Method</div>
                <div className="w-[80px]">Country</div>
                <div className="w-[140px] text-right">View / Status</div>
              </div>
              
              {/* Table Body */}
                {formattedPayments.length > 0 ? (
                  formattedPayments.map((payment) => (
                  <div key={payment.fullId} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <div className="w-[120px]">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{payment.id.slice(0, 8)}...</span>
                    </div>
                    <div className="w-[100px]">
                      <span className="text-sm font-geist text-gray-900 dark:text-gray-100">{payment.date}</span>
                    </div>
                    <div className="w-[160px]">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">{payment.customer}</div>
                      <div className="text-xs text-muted-foreground font-medium font-geist">{payment.customerEmail}</div>
                    </div>
                    <div className="w-[100px]">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-geist">{payment.amount} {payment.currency}</span>
                    </div>
                    <div className="w-[120px]">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">{payment.method}</span>
                    </div>
                    <div className="w-[80px]">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">{payment.country}</span>
                    </div>
                    <div className="w-[140px] text-right">
                        <div className="flex justify-end gap-2">
                          {/* Transaction Details Link */}
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/transactions/${payment.fullId}`}>
                              <InfoIcon className="h-4 w-4" />
                              <span className="sr-only">View Transaction Details</span>
                            </Link>
                          </Button>

                          <Badge variant="outline" className={cn(
                          "font-bold font-geist",
                            payment.status === 'completed' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                            payment.status === 'pending_verification' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                            payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                            payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                            payment.status === 'refunded' && "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                          )}>
                            {payment.status === 'pending_verification' 
                              ? 'pending verification' 
                              : payment.status}
                          </Badge>
                        </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-geist">No Payment History</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-geist mt-1">
                        {paymentsError ? `Error loading payments: ${paymentsError.message}` : 'No payment transactions found for your account'}
                      </p>
                      {userData && (
                        <p className="text-xs text-gray-500 mt-2">
                          User ID: {userData.id} | Role: {userData.role || 'merchant'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-xl font-bold text-red-600">Dashboard Error</h2>
        <p className="text-gray-600">An error occurred while loading the dashboard</p>
        <p className="text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}