'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Globe, Shield, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const widgets = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      link: "/users"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: CheckCircle,
      description: "Currently active",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      link: "/users"
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: CreditCard,
      description: "All transactions",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      link: "/payments"
    },
    {
      title: "Pending Verifications",
      value: stats.pendingPayments,
      icon: Clock,
      description: "Awaiting review",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      link: "/verification"
    },
    {
      title: "Countries",
      value: stats.totalCountries,
      icon: Globe,
      description: "Supported regions",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      link: "/countries"
    },
    {
      title: "Currencies",
      value: stats.totalCurrencies,
      icon: TrendingUp,
      description: "Available currencies",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      link: "/currencies"
    },
    {
      title: "Payment Methods",
      value: stats.totalPaymentMethods,
      icon: Shield,
      description: "Active methods",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      link: "/payment-methods"
    },
    {
      title: "Recent Registrations",
      value: stats.recentRegistrations,
      icon: AlertCircle,
      description: "Last 24 hours",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      link: "/users"
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map((widget, index) => {
        const Icon = widget.icon
        return (
          <Link key={index} href={widget.link}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
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
          </Link>
        )
      })}
    </div>
  )
} 