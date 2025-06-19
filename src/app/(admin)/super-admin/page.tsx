import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { 
  DocumentTextIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  EyeIcon,
  ClipboardIcon,
  PencilIcon,
  CreditCardIcon,
  ChartBarIcon,
  StarIcon,
  BoltIcon
} from '@heroicons/react/24/solid'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { DashboardStatsGrid } from '@/components/dashboard/dashboard-stats-grid'

export const metadata: Metadata = {
  title: 'Super Admin Dashboard - PXV Pay',
  description: 'Super Admin central control center for PXV Pay platform',
}

export default async function SuperAdminDashboard() {
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    
    // Get user session and redirect if not authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-600">{sessionError.message}</p>
        </div>
      )
    }
    
    if (!session) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-bold text-gray-600">Not Authenticated</h2>
          <p className="text-gray-600">Please sign in to access the dashboard</p>
        </div>
      )
    }

    // Get user profile including role and email for super admin check
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-bold text-red-600">Profile Error</h2>
          <p className="text-gray-600">Error loading user profile: {profileError.message}</p>
          <p className="text-sm text-gray-500">User ID: {session.user.id}</p>
          <p className="text-sm text-gray-500">Email: {session.user.email}</p>
        </div>
      )
    }

    // Check if user is super admin (using database role OR email)
    const isSuperAdminRole = profile?.role === 'super_admin'
    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' || 
                              session.user.email === 'dev-admin@pxvpay.com' || 
                              session.user.email === 'superadmin@pxvpay.com'
    
    const isSuperAdmin = isSuperAdminRole || isSuperAdminEmail
    
    if (!isSuperAdmin) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">You don't have super admin privileges</p>
          <p className="text-sm text-gray-500">Role: {profile?.role || 'No role'}</p>
          <p className="text-sm text-gray-500">Email: {session.user.email}</p>
        </div>
      )
    }

  const userName = profile?.email?.split('@')[0] || 'Super Admin'

  // Fetch recent payments for super admin view - using same logic as verification page
  let paymentsQuery = supabase.from('payments').select('*')
  
  // Super admins see all platform transactions
  const { data: recentPayments, error: paymentsError } = await paymentsQuery
    .order('created_at', { ascending: false })
    .limit(10)

  if (paymentsError) {
    console.error('Payments error:', paymentsError)
  }

  // Format payments for display - matching verification page format exactly
  const formattedPayments = recentPayments?.map(payment => ({
    id: payment.id || 'N/A',
    fullId: payment.id || 'N/A', // Keep full ID for linking
    date: payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'N/A',
    customer: payment.customer_name || 'N/A',
    customerEmail: payment.customer_email || '',
    amount: payment.amount && payment.currency ? payment.amount : 0,
    currency: payment.currency || 'USD',
    method: payment.payment_method || 'N/A',
    country: payment.country || 'N/A',
    status: payment.status || 'pending'
  })) || []

  return (
    <div className="flex flex-col gap-8">
      {/* Professional Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 shadow-lg">
            <StarIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="hero-title">Super Admin Control Center</h1>
            <p className="hero-subtitle mt-2">
              Welcome back, <span className="font-bold text-violet-600 dark:text-violet-400">{userName}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-violet-600 text-white border-violet-600 hover:bg-violet-700 font-semibold px-3 py-1">
            <StarIcon className="h-4 w-4 mr-2" />
            Super Administrator
          </Badge>
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-semibold px-3 py-1">
            <BoltIcon className="h-4 w-4 mr-2" />
            Full Platform Access
          </Badge>
        </div>
      </div>

      {/* Platform Overview */}
      <div>
        <h2 className="section-title mb-6">Platform Overview</h2>
        <DashboardStatsGrid />
      </div>

      {/* Payment History Section */}
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="section-title">Platform Payment History</h2>
            <p className="text-base font-medium text-gray-600 dark:text-gray-300 mt-1">
              Recent payment transactions across all merchants
            </p>
          </div>
          <Button variant="outline" size="default" className="gap-2 font-semibold" asChild>
            <Link href="/super-admin-transactions">
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              View All Transactions
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border shadow-sm bg-card">
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
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-geist">{payment.amount} {payment.currency}</span>
                    </div>
                    <div className="w-[120px]">
                      <span className="text-sm font-geist text-gray-900 dark:text-gray-100">{payment.method}</span>
                    </div>
                    <div className="w-[80px]">
                      <span className="text-sm font-geist text-gray-900 dark:text-gray-100">{payment.country}</span>
                    </div>
                    <div className="w-[140px] text-right">
                        <div className="flex justify-end gap-2">
                          {/* Transaction Details Link */}
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/super-admin-transactions/${payment.fullId}`}>
                              <InformationCircleIcon className="h-4 w-4" />
                              <span className="sr-only">View Transaction Details</span>
                            </Link>
                          </Button>

                          <Badge variant="outline" className={cn(
                          "font-semibold font-geist",
                            payment.status === 'completed' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                            payment.status === 'pending_verification' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                            payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                            payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
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
                        {paymentsError ? `Error loading payments: ${paymentsError.message}` : 'No payment transactions found'}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="section-title mb-6">Quick Actions</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Platform Management */}
          <Card className="violet-glow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <ShieldCheckIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold font-geist">Platform Management</CardTitle>
                  <CardDescription className="font-medium font-geist">Manage platform settings and configurations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/users">
                    <DocumentTextIcon className="h-4 w-4" />
                    User Management
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/verification">
                    <EyeIcon className="h-4 w-4" />
                    Payment Verification
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/settings">
                    <CogIcon className="h-4 w-4" />
                    Platform Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Management */}
          <Card className="violet-glow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <CreditCardIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold font-geist">Transaction Management</CardTitle>
                  <CardDescription className="font-medium font-geist">Monitor and manage all platform transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/super-admin-transactions">
                    <ChartBarIcon className="h-4 w-4" />
                    All Transactions
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/verification">
                    <ClipboardIcon className="h-4 w-4" />
                    Pending Verifications
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card className="violet-glow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <ChartBarIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold font-geist">System Monitoring</CardTitle>
                  <CardDescription className="font-medium font-geist">Monitor platform performance and health</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/api/test-connection" target="_blank">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    Test Connection
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 font-medium font-geist" asChild>
                  <Link href="/settings">
                    <CogIcon className="h-4 w-4" />
                    System Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Super Admin Dashboard Error:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-xl font-bold text-red-600">Dashboard Error</h2>
        <p className="text-gray-600">An error occurred while loading the dashboard</p>
        <p className="text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
} 