'use client'

import * as React from "react"
import { useEffect, useState } from 'react'
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
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
import { getGeographicAnalytics, type GeographicAnalytics } from '@/lib/actions/analytics-data-simple'

export function InteractiveGeographicChart() {
  const [data, setData] = useState<GeographicAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCountry, setActiveCountry] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getGeographicAnalytics()
        if (result.success && result.data) {
          setData(result.data)
          if (result.data.length > 0) {
            setActiveCountry(result.data[0].country_name)
          }
        } else {
          setError(result.error || 'Failed to fetch geographic data')
        }
      } catch (err) {
        setError('An error occurred while fetching geographic data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Transform data for the pie chart
  const chartData = data.map((item, index) => ({
    country: item.country_name,
    revenue: parseFloat(item.total_revenue),
    payments: item.payment_count,
    fill: `var(--chart-${(index % 5) + 1})`,
  }))

  // Create chart config dynamically
  const chartConfig: ChartConfig = {
    revenue: {
      label: "Revenue",
    },
    ...chartData.reduce((config, item, index) => {
      const key = item.country.toLowerCase().replace(/\s+/g, '_')
      config[key] = {
        label: item.country,
        color: `var(--chart-${(index % 5) + 1})`,
      }
      return config
    }, {} as Record<string, { label: string; color: string }>)
  }

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.country === activeCountry),
    [activeCountry, chartData]
  )

  const countries = React.useMemo(() => chartData.map((item) => item.country), [chartData])

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </CardContent>
      </Card>
    )
  }

  if (error || !chartData.length) {
    return (
      <Card className="h-full">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>{error || 'No geographic data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const id = "geographic-pie-chart"
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">Geographic Analytics</CardTitle>
          <CardDescription className="text-base font-medium text-gray-600 dark:text-gray-300 font-geist">
            Revenue distribution by country
          </CardDescription>
        </div>
        <Select value={activeCountry} onValueChange={setActiveCountry}>
          <SelectTrigger
            className="ml-auto h-7 w-[140px] rounded-lg pl-2.5"
            aria-label="Select a country"
          >
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {countries.map((country) => {
              const data = chartData.find(item => item.country === country)
              const configKey = country.toLowerCase().replace(/\s+/g, '_')
              const config = chartConfig[configKey]

              if (!config || !data) {
                return null
              }

              return (
                <SelectItem
                  key={country}
                  value={country}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  hideLabel 
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="country"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const activeData = chartData[activeIndex]
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          ${activeData?.revenue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          {activeData?.country}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 