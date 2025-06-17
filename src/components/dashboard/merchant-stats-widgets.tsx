'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ClockIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/solid'
import { 
  getPendingVerificationCount,
  getPaymentMethodsCount,
  getCurrenciesCount,
  getTotalPaymentsCount,
  getProductsCount
} from '@/lib/actions/dashboard-stats'

interface StatWidgetProps {
  title: string
  icon: React.ReactNode
  description: string
  fetchFunction: () => Promise<{ success: boolean; error: string | null; count: number }>
}

function StatWidget({ title, icon, description, fetchFunction }: StatWidgetProps) {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await fetchFunction()

      if (result.success) {
        setCount(result.count)
        setError(null)
      } else {
        setError(result.error)
        setCount(0)
      }

    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="violet-glow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon First */}
          <div className="flex-shrink-0">
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="card-number">
              {loading ? '...' : count.toLocaleString()}
            </div>
            <h3 className="card-title text-base mb-1">{title}</h3>
            <p className="card-description">
              {description}
            </p>
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PendingVerificationWidget() {
  return (
    <StatWidget
      title="Pending Verification"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <ClockIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Payments awaiting verification"
      fetchFunction={getPendingVerificationCount}
    />
  )
}

export function PaymentMethodsWidget() {
  return (
    <StatWidget
      title="Payment Methods"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <CreditCardIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Available payment methods"
      fetchFunction={getPaymentMethodsCount}
    />
  )
}

export function CurrenciesWidget() {
  return (
    <StatWidget
      title="Currencies"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <CurrencyDollarIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Supported currencies"
      fetchFunction={getCurrenciesCount}
    />
  )
}

export function TotalPaymentsWidget() {
  return (
    <StatWidget
      title="Total Payments"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <ChartBarIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="All payment transactions"
      fetchFunction={getTotalPaymentsCount}
    />
  )
}

export function ProductsWidget() {
  return (
    <StatWidget
      title="Products"
      icon={
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <CubeIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      }
      description="Total products created"
      fetchFunction={getProductsCount}
    />
  )
} 