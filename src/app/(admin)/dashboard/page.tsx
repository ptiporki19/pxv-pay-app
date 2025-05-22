import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  CreditCard,
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard - PXV Pay',
  description: 'Your payment system dashboard',
}

interface PaymentStatus {
  [key: string]: 'pending' | 'completed' | 'failed' | 'refunded'
}

export default async function DashboardPage() {
  // Initialize Supabase client
  const supabase = createClient()
  
  // Get user session and profile
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  
  // Fetch user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Fetch user count
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  // Fetch payment statistics
  const { count: totalPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*, user:users(email)')
    .order('created_at', { ascending: false })
    .limit(4)
  
  // Format payment data
  const formattedPayments = recentPayments?.map(payment => ({
    id: payment.id,
    date: new Date(payment.created_at).toISOString().split('T')[0],
    customer: payment.user?.email?.split('@')[0] || 'Customer',
    amount: `$${parseFloat(payment.amount).toFixed(2)}`,
    method: payment.payment_method || 'N/A',
    status: payment.status as PaymentStatus[keyof PaymentStatus]
  })) || []

  return (
    <div className="flex flex-col gap-6">
      {/* Header with welcome message and recent activity button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData?.email?.split('@')[0] || 'User'}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          View Recent Activity
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

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users on the platform
            </p>
          </CardContent>
        </Card>

        {/* Total Payments Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time payment transactions
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Payments awaiting verification
            </p>
          </CardContent>
        </Card>

        {/* Verify Payments Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verify Payments</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Review and approve payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Payment History</h2>
          <p className="text-sm text-muted-foreground">
            View all payment transactions and their status
          </p>
        </div>

        <div className="rounded-md border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Method</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formattedPayments.length > 0 ? (
                  formattedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">{payment.id}</td>
                      <td className="px-4 py-3">{payment.date}</td>
                      <td className="px-4 py-3">{payment.customer}</td>
                      <td className="px-4 py-3 font-medium">{payment.amount}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn(
                          payment.status === 'completed' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                          payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                          payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                          payment.status === 'refunded' && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        )}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                      No payments found. Payments will appear here once processed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center p-4 border-t">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View All Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 