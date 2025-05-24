'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CreditCard,
  Clock, 
  Globe,
  Coins,
  Activity,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, type DashboardStats } from '@/app/actions/dashboard-stats'

interface RealTimeStatsProps {
  userRole?: 'super_admin' | 'admin' | 'merchant'
}

export function RealTimeStats({ userRole = 'admin' }: RealTimeStatsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPayments: 0,
    pendingPayments: 0,
    countries: 0,
    currencies: 0,
    paymentMethods: 0
  })

  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = async () => {
    try {
      console.log('🔄 Client: Fetching stats via server action...')
      setLoading(true)
      
      const newStats = await getDashboardStats()
      console.log('📈 Client: Received stats:', newStats)
      
      setStats(newStats)
    } catch (error) {
      console.error('💥 Client: Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchStats()

    // Set up real-time subscriptions
    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        console.log('🔔 Users table changed, refetching...')
        fetchStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        console.log('🔔 Payments table changed, refetching...')
        fetchStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'currencies' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_methods' }, fetchStats)
      .subscribe()

    // Refresh every 30 seconds as backup
    const interval = setInterval(() => {
      console.log('⏰ Interval refresh triggered')
      fetchStats()
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  if (userRole === 'super_admin') {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered platform users
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/users?filter=active">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform transactions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions?status=pending">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Require admin attention
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered users on platform
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/countries">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.countries}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported countries
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/currencies">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currencies</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.currencies}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported currencies
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payment-methods">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.paymentMethods}
              </div>
              <p className="text-xs text-muted-foreground">
                Available payment methods
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        <Link href="/transactions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time payment transactions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions?status=pending">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Payments awaiting verification
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions/verify">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verify Payments</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Review and approve payments
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  )
} 