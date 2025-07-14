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
import { getTransactionStatusAnalytics, type TransactionStatusAnalytics } from '@/lib/actions/analytics-data-simple'

export function InteractiveTransactionStatusChart() {
  const [data, setData] = useState<TransactionStatusAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getTransactionStatusAnalytics()
        if (result.success && result.data) {
          setData(result.data)
          if (result.data.length > 0) {
            setActiveStatus(result.data[0].status)
          }
        } else {
          setError(result.error || 'Failed to fetch transaction status data')
        }
      } catch (err) {
        setError('An error occurred while fetching transaction status data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Transform data for the pie chart
  const chartData = data.map((item, index) => {
    // Assign colors based on status type
    let colorIndex = index % 5 + 1
    if (item.status.toLowerCase() === 'completed') colorIndex = 2 // green
    else if (item.status.toLowerCase() === 'pending') colorIndex = 3 // yellow
    else if (item.status.toLowerCase() === 'failed') colorIndex = 1 // red
    
    return {
      status: item.status,
      count: item.count,
      amount: parseFloat(item.total_amount),
      percentage: parseFloat(item.percentage),
      fill: `var(--chart-${colorIndex})`,
    }
  })

  // Create chart config dynamically
  const chartConfig: ChartConfig = {
    count: {
      label: "Transactions",
    },
    ...chartData.reduce((config, item, index) => {
      const key = item.status.toLowerCase().replace(/[\s\-]/g, '_')
      const colorIndex = item.status.toLowerCase() === 'completed' ? 2 : 
                        item.status.toLowerCase() === 'pending' ? 3 :
                        item.status.toLowerCase() === 'failed' ? 1 : (index % 5) + 1
      config[key] = {
        label: item.status,
        color: `var(--chart-${colorIndex})`,
      }
      return config
    }, {} as Record<string, { label: string; color: string }>)
  }

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.status === activeStatus),
    [activeStatus, chartData]
  )

  const statuses = React.useMemo(() => chartData.map((item) => item.status), [chartData])

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
            <p>{error || 'No transaction status data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const id = "transaction-status-pie-chart"
  const totalTransactions = chartData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">Transaction Status Analytics</CardTitle>
          <CardDescription className="text-base font-medium text-gray-600 dark:text-gray-300 font-geist">
            Distribution of transaction statuses
          </CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger
            className="ml-auto h-7 w-[140px] rounded-lg pl-2.5"
            aria-label="Select a status"
          >
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {statuses.map((status) => {
              const data = chartData.find(item => item.status === status)
              const configKey = status.toLowerCase().replace(/[\s\-]/g, '_')
              const config = chartConfig[configKey]

              if (!config || !data) {
                return null
              }

              return (
                <SelectItem
                  key={status}
                  value={status}
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
                    `${Number(value).toLocaleString()} transactions (${chartData.find(item => item.status === name)?.percentage}%)`,
                    name
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
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
                          {activeData?.percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          {activeData?.status}
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