'use client'

import * as React from "react"
import { useEffect, useState } from 'react'
import { TrendingUp, Loader2, Globe, CreditCard, CheckCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  getGeographicAnalytics, 
  getPaymentMethodAnalytics, 
  getTransactionStatusAnalytics,
  type GeographicAnalytics,
  type PaymentMethodAnalytics,
  type TransactionStatusAnalytics
} from '@/lib/actions/analytics-data-simple'

interface AnalyticsCardProps {
  title: string
  description: string
  icon: React.ReactNode
  data: Array<{
    name: string
    amount: number
    currency: string
    count?: number
    percentage?: string
  }>
  loading: boolean
  error: string | null
}

function AnalyticsCard({ title, description, icon, data, loading, error }: AnalyticsCardProps) {
  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            <span className="text-muted-foreground">Loading data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>{error || 'No data available'}</p>
            <p className="text-sm mt-2">Please check your data or try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.slice(0, 4).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              {item.count && (
                <p className="text-xs text-muted-foreground">{item.count} transactions</p>
              )}
              {item.percentage && (
                <p className="text-xs text-muted-foreground">{item.percentage} of total</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {item.currency} {item.amount.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function SimpleAnalyticsCards() {
  // Geographic Analytics State
  const [geoData, setGeoData] = useState<GeographicAnalytics[]>([])
  const [geoLoading, setGeoLoading] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Payment Methods State
  const [paymentData, setPaymentData] = useState<PaymentMethodAnalytics[]>([])
  const [paymentLoading, setPaymentLoading] = useState(true)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Transaction Status State
  const [statusData, setStatusData] = useState<TransactionStatusAnalytics[]>([])
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch Geographic Analytics
    async function fetchGeoData() {
      try {
        setGeoLoading(true)
        setGeoError(null)
        const result = await getGeographicAnalytics()
        if (result.success && result.data) {
          setGeoData(result.data)
        } else {
          setGeoError(result.error || 'Failed to fetch geographic data')
        }
      } catch (err) {
        console.error('Geographic analytics error:', err)
        setGeoError('An error occurred while fetching geographic data')
      } finally {
        setGeoLoading(false)
      }
    }

    // Fetch Payment Methods Analytics
    async function fetchPaymentData() {
      try {
        setPaymentLoading(true)
        setPaymentError(null)
        const result = await getPaymentMethodAnalytics()
        if (result.success && result.data) {
          setPaymentData(result.data)
        } else {
          setPaymentError(result.error || 'Failed to fetch payment method data')
        }
      } catch (err) {
        console.error('Payment method analytics error:', err)
        setPaymentError('An error occurred while fetching payment method data')
      } finally {
        setPaymentLoading(false)
      }
    }

    // Fetch Transaction Status Analytics
    async function fetchStatusData() {
      try {
        setStatusLoading(true)
        setStatusError(null)
        const result = await getTransactionStatusAnalytics()
        if (result.success && result.data) {
          setStatusData(result.data)
        } else {
          setStatusError(result.error || 'Failed to fetch transaction status data')
        }
      } catch (err) {
        console.error('Transaction status analytics error:', err)
        setStatusError('An error occurred while fetching transaction status data')
      } finally {
        setStatusLoading(false)
      }
    }

    fetchGeoData()
    fetchPaymentData()
    fetchStatusData()
  }, [])

  // Transform data for cards
  const geoCardData = geoData.map(item => ({
    name: item.country_name || 'Unknown',
    amount: parseFloat(item.total_revenue || '0'),
    currency: item.currency_code || 'USD',
    count: item.payment_count
  }))

  const paymentCardData = paymentData.map(item => ({
    name: item.payment_method || 'Unknown',
    amount: parseFloat(item.total_revenue || '0'),
    currency: item.currency_code || 'USD',
    count: item.transaction_count
  }))

  const statusCardData = statusData.map(item => ({
    name: item.status || 'Unknown',
    amount: parseFloat(item.total_amount || '0'),
    currency: item.currency_code || 'USD',
    count: item.count,
    percentage: item.percentage
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnalyticsCard
        title="Geographic Analytics"
        description="Top countries by revenue"
        icon={<Globe className="h-5 w-5 text-violet-600" />}
        data={geoCardData}
        loading={geoLoading}
        error={geoError}
      />
      
      <AnalyticsCard
        title="Payment Methods"
        description="Top payment methods by revenue"
        icon={<CreditCard className="h-5 w-5 text-violet-600" />}
        data={paymentCardData}
        loading={paymentLoading}
        error={paymentError}
      />
      
      <AnalyticsCard
        title="Transaction Status"
        description="Transaction completion breakdown"
        icon={<CheckCircle className="h-5 w-5 text-violet-600" />}
        data={statusCardData}
        loading={statusLoading}
        error={statusError}
      />
    </div>
  )
} 