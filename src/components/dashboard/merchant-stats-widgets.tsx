'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
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
  href: string
}

function StatWidget({ title, icon, description, fetchFunction, href }: StatWidgetProps) {
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
    <Link href={href}>
      <Card className="violet-glow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-violet-100 dark:border-violet-800/50 cursor-pointer h-[140px]">
        <CardContent className="p-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Content Section - Left Side */}
            <div className="flex-1 min-w-0">
              <div className="text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white font-geist mb-2">
              {loading ? '...' : count.toLocaleString()}
            </div>
              <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white font-geist mb-1">{title}</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-geist">
              {description}
            </p>
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {error}
              </p>
            )}
          </div>
            
            {/* Icon Section - Right Side */}
            <div className="flex-shrink-0 ml-4">
              {icon}
            </div>
        </div>
      </CardContent>
    </Card>
    </Link>
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
      href="/verification"
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
      href="/payment-methods"
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
      href="/currencies"
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
      href="/transactions"
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
      href="/content"
    />
  )
} 