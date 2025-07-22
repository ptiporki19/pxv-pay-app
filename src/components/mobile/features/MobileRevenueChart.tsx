"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Loader2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
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
} satisfies ChartConfig

interface MobileRevenueChartProps {
  height?: number
  showFilters?: boolean
  selectedCountry?: string
  selectedTimeRange?: string
  onDataUpdate?: (data: any) => void
}

export function MobileRevenueChart({ 
  height = 200, 
  showFilters = true,
  onDataUpdate,
  selectedCountry: externalSelectedCountry,
  selectedTimeRange: externalSelectedTimeRange
}: MobileRevenueChartProps) {
  const [timeRange, setTimeRange] = useState(externalSelectedTimeRange || "30")
  const [selectedCountry, setSelectedCountry] = useState(externalSelectedCountry || "All Countries")
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

  // Sync external props with internal state
  useEffect(() => {
    if (externalSelectedCountry !== undefined) {
      setSelectedCountry(externalSelectedCountry)
    }
  }, [externalSelectedCountry])

  useEffect(() => {
    if (externalSelectedTimeRange !== undefined) {
      setTimeRange(externalSelectedTimeRange)
    }
  }, [externalSelectedTimeRange])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const result = await getDailyRevenueAnalytics(timeRange, selectedCountry)
        if (result.success && result.data) {
          setData(result.data)
          setCurrentCurrency(result.currency || 'USD')
          
          // Notify parent component of data update
          if (onDataUpdate) {
            const totalRevenue = result.data.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0)
            const totalTransactions = result.data.reduce((sum, item) => sum + item.transaction_count, 0)
            onDataUpdate({
              totalRevenue,
              totalTransactions,
              currency: result.currency || 'USD',
              data: result.data
            })
          }
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
  }, [timeRange, selectedCountry, onDataUpdate])

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
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
          <span className="text-sm text-muted-foreground">Loading chart...</span>
        </div>
      </div>
    )
  }

  if (error || !chartData.length) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">{error || 'No revenue data available'}</p>
        </div>
      </div>
    )
  }

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalTransactions = chartData.reduce((sum, item) => sum + item.transactions, 0)

  return (
    <div className="w-full space-y-3">
      {showFilters && (
        <div className="flex gap-2">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country} className="text-xs">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="30" className="text-xs">Last 30 days</SelectItem>
              <SelectItem value="90" className="text-xs">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div style={{ height: `${height}px` }}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            }}
          >
            <defs>
              <linearGradient id="fillRevenueMobile" x1="0" y1="0" x2="0" y2="1">
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
              tickMargin={8}
              minTickGap={20}
              tickFormatter={formatDateForDisplay}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                      weekday: "short",
                      month: "short",
                      day: "numeric",
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
              fill="url(#fillRevenueMobile)"
              fillOpacity={0.6}
              stroke="hsl(270, 70%, 50%)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "hsl(270, 70%, 60%)",
                stroke: "hsl(270, 70%, 50%)",
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="font-normal text-violet-600">{currentCurrency} {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="text-muted-foreground">total</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-normal">{totalTransactions}</span>
            <span className="text-muted-foreground">transactions</span>
          </div>
        </div>
      </div>
    </div>
  )
}