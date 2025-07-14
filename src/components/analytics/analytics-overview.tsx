'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity, CreditCard, Users } from 'lucide-react'
import { getAnalyticsSummary } from '@/lib/actions/analytics-data-simple'

interface AnalyticsOverviewData {
  current_month: any
  previous_month: any
  growth_rate: string
  active_checkout_links: number
}

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAnalyticsSummary()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch analytics data')
        }
      } catch (err) {
        setError('An error occurred while fetching analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <AnalyticsOverviewSkeleton />
  }

  if (error || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              {error || 'No data available'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const current = data.current_month
  const growthRate = parseFloat(data.growth_rate)
  const isPositiveGrowth = growthRate >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${current?.total_revenue ? parseFloat(current.total_revenue).toLocaleString() : '0'}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            {isPositiveGrowth ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={isPositiveGrowth ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(growthRate).toFixed(1)}%
            </span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {current?.transaction_count || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {current?.success_rate || '0'}%
          </div>
          <p className="text-xs text-muted-foreground">
            Payment completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Links</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.active_checkout_links}
          </div>
          <p className="text-xs text-muted-foreground">
            Checkout links active
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-[100px] animate-pulse bg-muted rounded" />
            <div className="h-4 w-4 animate-pulse bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-[120px] animate-pulse bg-muted rounded" />
            <div className="h-3 w-[80px] mt-2 animate-pulse bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 