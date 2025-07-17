'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  UsersIcon, 
  CreditCardIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/solid'
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
      icon: UsersIcon,
      description: "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      link: "/users",
      requiresSuperAdmin: true
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: CheckCircleIcon,
      description: "Currently active",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      link: "/users",
      requiresSuperAdmin: true
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCardIcon,
      description: "All payment transactions",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      link: isSuperAdmin ? "/super-admin-transactions" : "/payments",
      requiresSuperAdmin: false
    },
    {
      title: "Pending Verification",
      value: stats.pendingPayments,
      icon: ClockIcon,
      description: "Payments awaiting verification",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      link: "/verification",
      requiresSuperAdmin: false
    },
    {
      title: "Payment Methods",
      value: stats.totalPaymentMethods,
      icon: ShieldCheckIcon,
      description: "Available payment methods",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      link: "/payment-methods",
      requiresSuperAdmin: false
    },
    {
      title: "Products",
      value: 1,
      icon: ExclamationCircleIcon,
      description: "Total products created",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      link: "/content",
      requiresSuperAdmin: false
    }
  ]

  const StatCard = ({ widget, index }: { widget: any, index: number }) => {
    const Icon = widget.icon
    const shouldLink = !widget.requiresSuperAdmin || isSuperAdmin
    
    const cardContent = (
      <Card className={`transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50 ${shouldLink ? 'cursor-pointer' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white font-roboto mb-2">
                {loading ? '...' : widget.value.toLocaleString()}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white font-roboto mb-1">{widget.title}</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-roboto">
                {widget.description}
              </p>
            </div>
            
            {/* Icon Section */}
            <div className="flex-shrink-0 ml-4">
              <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Icon className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </div>
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
    </div>
  )
} 