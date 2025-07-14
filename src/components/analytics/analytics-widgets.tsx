'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { 
  Loader2
} from 'lucide-react'
import { 
  CurrencyDollarIcon as DollarSign,
  ChartBarIcon as Activity,
  GlobeAltIcon as Globe,
  CreditCardIcon as CreditCard,
  LinkIcon as LinkIcon,
  ArrowTrendingUpIcon as TrendingUp,
  CubeIcon
} from '@heroicons/react/24/solid'
import { 
  getRevenueAnalytics,
  getGeographicAnalytics,
  getPaymentMethodAnalytics,
  getCheckoutLinkAnalytics,
  getTransactionStatusAnalytics,
  getAnalyticsSummary
} from '@/lib/actions/analytics-data-simple'
import { getTotalPaymentsCount } from '@/lib/actions/dashboard-stats'

interface AnalyticsWidgetProps {
  title: string
  icon: React.ReactNode
  description: string
  fetchFunction: () => Promise<any>
  href: string
  formatValue?: (value: any) => string
  valueClassName?: string
}

function AnalyticsWidget({ title, icon, description, fetchFunction, href, formatValue, valueClassName }: AnalyticsWidgetProps) {
  const [value, setValue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await fetchFunction()
      setValue(result)
      setError(null)
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setValue(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const displayValue = loading ? (
    <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
  ) : value !== null ? (formatValue ? formatValue(value) : value) : 'N/A'

  return (
    <Link href={href}>
      <Card className={`violet-glow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50 h-full ${href.includes('?view=') ? 'cursor-pointer' : ''}`}>
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            {/* Icon Section */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                {icon}
              </div>
            </div>
            {/* Value Section */}
            <div className="flex-1 min-w-0 text-right">
              <div className={`font-black tracking-tight text-gray-900 dark:text-white font-geist mb-2 ${valueClassName || 'text-3xl lg:text-4xl'}`}>
                {loading ? '...' : (formatValue ? formatValue(value) : value)}
              </div>
            </div>
          </div>
          {/* Content Section */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white font-geist mb-1">{title}</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-geist">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function TotalRevenueWidget() {
  return (
    <AnalyticsWidget
      title="Total Payments"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="All payment transactions"
      fetchFunction={async () => {
        const result = await getTotalPaymentsCount()
        return result.count || 0
      }}
      formatValue={(value) => `${value.toLocaleString()}`}
      href="/transactions"
    />
  )
}

export function RevenueAnalyticsWidget() {
  return (
    <AnalyticsWidget
      title="Best Performing Product"
      icon={<CubeIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
      description="Product with the most sales"
      fetchFunction={async () => {
        const result = await getCheckoutLinkAnalytics()
        if (result.success && result.data && result.data.length > 0) {
          return result.data[0].title
        }
        return "N/A"
      }}
      href="/analytics?view=checkout-links"
      valueClassName="text-2xl lg:text-3xl truncate"
    />
  )
}

export function GeographicAnalyticsWidget() {
  return (
    <AnalyticsWidget
      title="Country Performance"
      icon={<Globe className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
      description="Highest revenue country"
      fetchFunction={async () => {
        const result = await getGeographicAnalytics()
        if (result.success && result.data && result.data.length > 0) {
          return result.data[0]?.country_name || 'N/A'
        }
        return 'N/A'
      }}
      href="/analytics?view=geographic"
      valueClassName="text-2xl lg:text-3xl truncate"
    />
  )
}

export function PaymentMethodAnalyticsWidget() {
  return (
    <AnalyticsWidget
      title="Top Payment Method"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Most used payment method"
      fetchFunction={async () => {
        const result = await getPaymentMethodAnalytics()
        const data = result?.data
        return data && data.length > 0 ? data[0]?.payment_method : 'N/A'
      }}
      href="/payment-methods"
    />
  )
}

export function CheckoutLinkAnalyticsWidget() {
  return (
    <AnalyticsWidget
      title="Active Links"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <LinkIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Active checkout links"
      fetchFunction={async () => {
        const result = await getCheckoutLinkAnalytics()
        const data = result?.data
        return data?.length || 0
      }}
      href="/checkout-links"
    />
  )
}

export function TransactionStatusAnalyticsWidget() {
  return (
    <AnalyticsWidget
      title="Success Rate"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <Activity className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Transaction success rate"
      fetchFunction={async () => {
        const result = await getTransactionStatusAnalytics()
        if (result.success && result.data && result.data.length > 0) {
          const total = result.data.reduce((sum, item) => sum + item.count, 0)
          const successful = result.data.find(item => item.status === 'completed')?.count || 0
          return total > 0 ? (successful / total * 100) : 0
        }
        return 0
      }}
      formatValue={(value) => `${value.toFixed(1)}%`}
      href="/transactions"
    />
  )
} 