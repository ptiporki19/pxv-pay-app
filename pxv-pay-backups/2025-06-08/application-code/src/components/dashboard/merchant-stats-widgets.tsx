'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Package
} from 'lucide-react'
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? '...' : count}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
        {error && (
          <p className="text-xs text-red-500 mt-1">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function PendingVerificationWidget() {
  return (
    <StatWidget
      title="Pending Verification"
      icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      description="Payments awaiting verification"
      fetchFunction={getPendingVerificationCount}
    />
  )
}

export function PaymentMethodsWidget() {
  return (
    <StatWidget
      title="Payment Methods"
      icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      description="Available payment methods"
      fetchFunction={getPaymentMethodsCount}
    />
  )
}

export function CurrenciesWidget() {
  return (
    <StatWidget
      title="Currencies"
      icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      description="Supported currencies"
      fetchFunction={getCurrenciesCount}
    />
  )
}

export function TotalPaymentsWidget() {
  return (
    <StatWidget
      title="Total Payments"
      icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      description="All payment transactions"
      fetchFunction={getTotalPaymentsCount}
    />
  )
}

export function ProductsWidget() {
  return (
    <StatWidget
      title="Products"
      icon={<Package className="h-4 w-4 text-muted-foreground" />}
      description="Total products created"
      fetchFunction={getProductsCount}
    />
  )
} 