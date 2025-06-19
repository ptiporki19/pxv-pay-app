import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Shield, 
  Settings, 
  ArrowRight,
  Crown,
  Activity,
  ExternalLink,
  Info,
  Eye,
  Copy,
  PenTool,
  CreditCard,
  BarChart3
} from 'lucide-react'
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
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Get user session and redirect if not authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    // Let the RouteGuard component handle the redirect
    return null
  }

  // Get user profile including role and email for super admin check
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check if user is super admin (using ONLY database role)
  const isSuperAdminRole = profile?.role === 'super_admin'
  
  if (!isSuperAdminRole) {
    // Let the RouteGuard component handle the redirect
    return null
  }

  const userName = profile?.email?.split('@')[0] || 'Super Admin'

  // Fetch recent payments for super admin view - using same logic as verification page
  let paymentsQuery = supabase.from('payments').select('*')
  
  // Super admins see all platform transactions, regular merchants see only their own
  if (!isSuperAdminRole) {
    paymentsQuery = paymentsQuery.eq('merchant_id', session.user.id)
  }

  const { data: recentPayments, error: paymentsError } = await paymentsQuery
    .order('created_at', { ascending: false })
    .limit(10)

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
      {/* Header Section with Super Admin identification */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black dark:bg-white">
            <Crown className="h-6 w-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Control Center</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{userName}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-black text-white dark:bg-white dark:text-black border-black dark:border-white">
            <Crown className="h-3 w-3 mr-1" />
            Super Administrator
          </Badge>
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <Activity className="h-3 w-3 mr-1" />
            Full Platform Access
          </Badge>
        </div>
      </div>

      {/* Real-time Dashboard Statistics */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Platform Overview</h2>
        <DashboardStatsGrid />
        <p className="text-xs text-muted-foreground mt-4">
          📊 Real-time data • Updates every 30 seconds • Click widgets to navigate
        </p>
      </div>

      {/* Payment History Section */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Platform Payment History</h2>
            <p className="text-sm text-muted-foreground">
              Recent payment transactions across all merchants
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/super-admin-transactions">
              <ExternalLink className="h-4 w-4" />
              View All Transactions
            </Link>
          </Button>
        </div>

        <div className="rounded-md border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
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
                    <tr key={payment.fullId} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                          {/* Transaction Details Link */}
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/super-admin-transactions/${payment.fullId}`}>
                              <Info className="h-4 w-4" />
                              <span className="sr-only">View Transaction Details</span>
                            </Link>
                          </Button>

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
                      No recent transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Platform Management</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
          {/* User Management Card */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription>Manage all platform users and their permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                View, activate, deactivate, and manage user roles across the platform. Monitor user activity and maintain security.
              </p>
              <Button asChild className="w-full btn-primary">
                <Link href="/users" className="flex items-center justify-center gap-2">
                  Access User Management
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Website Content (Blog) Management Card */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Website Content</CardTitle>
                  <CardDescription>Manage blog posts and website content</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Create, edit, and publish blog posts. Manage all website content that's visible to the public and merchants.
              </p>
              <Button asChild className="w-full btn-primary">
                <Link href="/blog-management" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Blog Management
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Audit Logs Card */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Audit Logs</CardTitle>
                  <CardDescription>Monitor all platform activities and changes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Track all administrative actions, user activities, and system changes for security and compliance monitoring.
              </p>
              <Button asChild className="w-full btn-primary">
                <Link href="/audit-logs" className="flex items-center justify-center gap-2">
                  View Audit Logs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Secondary Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          
          {/* Platform Settings */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle className="text-base">Platform Settings</CardTitle>
                  <CardDescription>Configure global platform settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" asChild className="w-full">
                <Link href="/settings">
                  Configure Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Payment Verification */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle className="text-base">Payment Verification</CardTitle>
                  <CardDescription>Review pending payment verifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" asChild className="w-full">
                <Link href="/verification">
                  Review Payments
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
} 