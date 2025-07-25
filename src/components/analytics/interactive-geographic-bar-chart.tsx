'use client'

import * as React from "react"
import { useEffect, useState } from 'react'
import { Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { getGeographicAnalytics, type GeographicAnalytics } from '@/lib/actions/analytics-data-simple'

export function InteractiveGeographicBarChart() {
  const [data, setData] = useState<GeographicAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await getGeographicAnalytics()
        if (result.success && result.data) {
          // Limit to top 4 countries for clean display without scrolling
          setData(result.data.slice(0, 4))
        } else {
          setError(result.error || 'Failed to fetch geographic data')
        }
      } catch (err) {
        console.error('Geographic analytics error:', err)
        setError('An error occurred while fetching geographic data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-roboto">
            Geographic Analytics
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-300 font-roboto">
            Top countries by revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
            <span className="text-sm text-muted-foreground">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length) {
    return (
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-roboto">
            Geographic Analytics
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-300 font-roboto">
            Top countries by revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{error || 'No geographic data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const topCountry = data[0]

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-roboto">
          Geographic Analytics
        </CardTitle>
        <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-300 font-roboto">
          Top countries by revenue
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[340px] space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors">
            <div className="flex-1 min-w-0 pr-3">
              <p className="font-semibold text-sm truncate" title={item.country_name || 'Unknown'}>
                {item.country_name || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">{item.payment_count || 0} transactions</p>
              <p className="text-xs text-muted-foreground">{parseFloat(item.success_rate || '0').toFixed(2)}% success rate</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-base text-violet-500">
                {item.currency_code} {parseFloat(item.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg: {item.currency_code} {parseFloat(item.avg_amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-3">
        <div className="text-xs text-muted-foreground w-full">
          <span className="truncate block" title={`Leading: ${topCountry.country_name} - ${topCountry.currency_code} ${parseFloat(topCountry.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            Leading: {topCountry.country_name} - {topCountry.currency_code} {parseFloat(topCountry.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
} 