'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Globe, Shield, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalPayments: number
  pendingPayments: number
  totalCountries: number
  totalCurrencies: number
  totalPaymentMethods: number
  recentRegistrations: number
}

export function DashboardStatsGrid() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalCountries: 0,
    totalCurrencies: 0,
    totalPaymentMethods: 0,
    recentRegistrations: 0
  })
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if super admin by email or role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        const isSuper = profile?.role === 'super_admin' || 
          user.email === 'admin@pxvpay.com' || 
          user.email === 'dev-admin@pxvpay.com' || 
          user.email === 'superadmin@pxvpay.com'
        
        setIsSuperAdmin(isSuper)
      }
    }

    checkUserRole()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Set up real-time subscriptions for stats updates
    const supabase = createClient()

    // Subscribe to payments table changes for real-time updates
    const paymentsSubscription = supabase
      .channel('payments-stats-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments'
      }, () => {
        // Refresh stats when payments change
        console.log('📊 Payment change detected, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    // Subscribe to users table changes for user stats
    const usersSubscription = supabase
      .channel('users-stats-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        // Refresh stats when users change
        console.log('👥 User change detected, refreshing stats...')
        fetchStats()
      })
      .subscribe()

    // Subscribe to payment methods changes
    const paymentMethodsSubscription = supabase
      .channel('payment-methods-stats-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_methods'
      }, () => {
        // Refresh stats when payment methods change
        console.log('💳 Payment method change detected, refreshing stats...')
        fetchStats()
      })
      .subscribe()
    
    // Refresh stats every 30 seconds as fallback
    const interval = setInterval(fetchStats, 30000)
    
    return () => {
      clearInterval(interval)
      supabase.removeChannel(paymentsSubscription)
      supabase.removeChannel(usersSubscription)
      supabase.removeChannel(paymentMethodsSubscription)
    }
  }, [])

  const widgets = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      link: "/users",
      requiresSuperAdmin: true
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: CheckCircle,
      description: "Currently active",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      link: "/users",
      requiresSuperAdmin: true
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCard,
      description: "All transactions",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      link: isSuperAdmin ? "/super-admin-transactions" : "/payments",
      requiresSuperAdmin: false
    },
    {
      title: "Pending Verifications",
      value: stats.pendingPayments,
      icon: Clock,
      description: "Awaiting review",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      link: "/verification",
      requiresSuperAdmin: false
    },
    {
      title: "Payment Methods",
      value: stats.totalPaymentMethods,
      icon: Shield,
      description: "Your active methods",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      link: "/payment-methods",
      requiresSuperAdmin: false
    },
    {
      title: "Recent Registrations",
      value: stats.recentRegistrations,
      icon: AlertCircle,
      description: "Last 24 hours",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      link: "/users",
      requiresSuperAdmin: true
    }
  ]

  const StatCard = ({ widget, index }: { widget: any, index: number }) => {
        const Icon = widget.icon
    const shouldLink = !widget.requiresSuperAdmin || isSuperAdmin
    
    const cardContent = (
      <Card className={`${shouldLink ? 'hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${widget.bgColor}`}>
                  <Icon className={`h-4 w-4 ${widget.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : widget.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {widget.description}
                </p>
              </CardContent>
            </Card>
    )

    return shouldLink ? (
      <Link key={index} href={widget.link}>
        {cardContent}
          </Link>
    ) : (
      <div key={index}>
        {cardContent}
      </div>
        )
  }

  return (
    <div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget, index) => (
          <StatCard key={index} widget={widget} index={index} />
        ))}
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        📊 Real-time updates active • Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  )
} 