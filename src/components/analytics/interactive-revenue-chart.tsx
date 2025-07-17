'use client'

import * as React from "react"
import { useEffect, useState } from 'react'
import { TrendingUp, Loader2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDailyRevenueAnalytics, getGeographicAnalytics, type DailyRevenueAnalytics } from '@/lib/actions/analytics-data-simple'

const chartConfig = {
  revenue: {
    label: "Amount Processed",
    color: "hsl(270, 70%, 50%)", // Violet color
  },
  transactions: {
    label: "Transactions",
    color: "hsl(270, 70%, 60%)",
  },
} satisfies ChartConfig

export function InteractiveRevenueChart() {
  const [timeRange, setTimeRange] = React.useState("30")
  const [selectedCountry, setSelectedCountry] = React.useState("All Countries")
  const [data, setData] = useState<DailyRevenueAnalytics[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD')

  useEffect(() => {
    async function fetchCountries() {
      try {
        const result = await getGeographicAnalytics()
        if (result.success && result.data) {
          const countryNames = result.data.map(item => item.country_name)
          setCountries(['All Countries', ...countryNames])
        }
      } catch (err) {
        console.error('Error fetching countries:', err)
      }
    }
    fetchCountries()
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        // Pass the selected country to the analytics function
        const result = await getDailyRevenueAnalytics(timeRange, selectedCountry)
        if (result.success && result.data) {
          setData(result.data)
          // Use the currency returned from the database
          setCurrentCurrency(result.currency || 'USD')
        } else {
          setError(result.error || 'Failed to fetch revenue data')
        }
      } catch (err) {
        setError('An error occurred while fetching revenue data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange, selectedCountry])

  // Transform the data for the chart
  const chartData = data.map(item => ({
    date: item.date,
    revenue: parseFloat(item.total_revenue),
    transactions: item.transaction_count
  }))

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    const days = parseInt(timeRange)
    
    if (days <= 7) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } else if (days <= 30) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  if (loading) {
    return (
      <Card className="h-[500px]">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            <span className="text-muted-foreground">Loading chart...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !chartData.length) {
    return (
      <Card className="h-[500px]">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>{error || 'No revenue data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalTransactions = chartData.reduce((sum, item) => sum + item.transactions, 0)
  const avgDaily = totalRevenue / chartData.length || 0

  return (
    <Card className="h-[500px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-roboto">
            Total Amount Processed
          </CardTitle>
          <CardDescription className="text-base font-medium text-gray-600 dark:text-gray-300 font-roboto">
            Daily processing amounts over the selected time period
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Select a country"
            >
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {countries.map((country) => (
                <SelectItem key={country} value={country} className="rounded-lg">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(270, 70%, 50%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(270, 70%, 50%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={formatDateForDisplay}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => `${currentCurrency} ${value.toLocaleString()}`}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(270, 70%, 50%)", strokeWidth: 1, strokeOpacity: 0.5 }}
              content={
                <ChartTooltipContent
                  className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm shadow-xl"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => [
                    `${currentCurrency} ${Number(value).toLocaleString()}`,
                    "Amount Processed"
                  ]}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              fillOpacity={0.6}
              stroke="hsl(270, 70%, 50%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                fill: "hsl(270, 70%, 60%)",
                stroke: "hsl(270, 70%, 50%)",
              }}
            />
          </AreaChart>
        </ChartContainer>
        
        {/* Moved from CardFooter for better layout */}
        <div className="pt-4">
          <div className="flex w-full items-start gap-2">
            <div className="grid gap-1 w-full">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-xl font-bold text-violet-500">{currentCurrency} {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <span className="text-sm text-muted-foreground font-medium">total processed</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 leading-none">
                <span>{currentCurrency} {avgDaily.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/day average</span>
                <span className="font-bold">·</span>
                <span>{totalTransactions} transactions</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 