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

export const metadata: Metadata = {
  title: 'Dashboard - PXV Pay',
  description: 'Your payment system dashboard',
}

export default function DashboardPage() {
  // In a real app, this would be fetched from the API
  const userData = {
    email: 'petitporky0@gmail.com'
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with welcome message and recent activity button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData.email}</p>
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
            <div className="text-2xl font-bold">69</div>
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
            <div className="text-2xl font-bold">350</div>
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
            <div className="text-2xl font-bold">2</div>
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
            <div className="text-2xl font-bold">2</div>
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
                {/* Row 1 */}
                <tr className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">PAY-123</td>
                  <td className="px-4 py-3">2023-08-15</td>
                  <td className="px-4 py-3">John Doe</td>
                  <td className="px-4 py-3 font-medium">$500</td>
                  <td className="px-4 py-3">Bank Transfer</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                      completed
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Details</span>
                    </Button>
                  </td>
                </tr>
                
                {/* Row 2 */}
                <tr className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">PAY-124</td>
                  <td className="px-4 py-3">2023-08-16</td>
                  <td className="px-4 py-3">Jane Smith</td>
                  <td className="px-4 py-3 font-medium">$350</td>
                  <td className="px-4 py-3">Mobile Money</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                      pending
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Details</span>
                    </Button>
                  </td>
                </tr>
                
                {/* Row 3 */}
                <tr className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">PAY-125</td>
                  <td className="px-4 py-3">2023-08-17</td>
                  <td className="px-4 py-3">Bob Johnson</td>
                  <td className="px-4 py-3 font-medium">$1200</td>
                  <td className="px-4 py-3">Crypto</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                      completed
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Details</span>
                    </Button>
                  </td>
                </tr>
                
                {/* Row 4 */}
                <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">PAY-126</td>
                  <td className="px-4 py-3">2023-08-18</td>
                  <td className="px-4 py-3">Customer 1</td>
                  <td className="px-4 py-3 font-medium">$341</td>
                  <td className="px-4 py-3">Bank Transfer</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                      pending
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Details</span>
                    </Button>
                  </td>
                </tr>
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