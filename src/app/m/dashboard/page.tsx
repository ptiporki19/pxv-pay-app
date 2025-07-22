"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChartBarIcon,
  GlobeAltIcon,
  CreditCardIcon,
  LinkIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  UserIcon,
  CubeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline"
import { MobileStatsCards } from "@/components/mobile/features/MobileStatsCards"
import { MobileAnalyticsCard } from "@/components/mobile/features/MobileAnalyticsCard"
import { MobileRevenueChart } from "@/components/mobile/features/MobileRevenueChart"
import { PaymentVerificationCard } from "@/components/mobile/features/PaymentVerificationCard"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getRevenueAnalytics,
  getGeographicAnalytics,
  getPaymentMethodAnalytics,
  getCheckoutLinkAnalytics,
  getTransactionStatusAnalytics,
  getDailyRevenueAnalytics
} from "@/lib/actions/analytics-data-simple"
import {
  getTotalPaymentsCount,
  getPendingVerificationCount
} from "@/lib/actions/dashboard-stats"
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type AnalyticsView = 'processed' | 'countries' | 'methods' | 'products' | 'transactions' | 'others'

interface DashboardData {
  totalPayments: number
  totalRevenue: number
  bestProduct: string
  bestCountry: string
  successRate: number
  activeCountries: number
  revenueData: any[]
  geographicData: any[]
  paymentMethodData: any[]
  checkoutLinkData: any[]
  transactionStatusData: any[]
  pendingVerifications: number
  totalProducts: number
  totalCheckoutLinks: number
  totalPaymentMethods: number
  verifiedTransactions: number
}

interface Transaction {
  id: string
  fullId: string
  date: string
  customer: string
  customerEmail: string
  amount: number
  currency: string
  method: string
  country: string
  status: string
}

const MobileDashboardHeader = ({ pendingCount }: { pendingCount: number }) => {
  const router = useRouter()
  
  return (
    <div className="bg-background px-3 py-4 mt-16">
      {/* Dashboard Title and Link Button on same line with increased spacing */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-foreground">Dashboard</h1>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 text-xs font-normal h-7"
          onClick={() => router.push('/m/checkout-links/create')}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Link
        </Button>
      </div>
    </div>
  )
}

const PlatformAnalyticsTabs = ({
  activeView,
  setActiveView,
  pendingCount
}: {
  activeView: AnalyticsView
  setActiveView: (view: AnalyticsView) => void
  pendingCount: number
}) => {
  const router = useRouter()
  
  const tabs = [
    { id: 'processed' as AnalyticsView, label: 'Processed' },
    { id: 'countries' as AnalyticsView, label: 'Countries' },
    { id: 'methods' as AnalyticsView, label: 'Methods' },
    { id: 'products' as AnalyticsView, label: 'Products' },
    { id: 'transactions' as AnalyticsView, label: 'Transactions' },
    { id: 'others' as AnalyticsView, label: 'Others' }
  ]

  return (
    <div className="px-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-foreground">Platform Analytics</h2>
        {pendingCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs font-normal border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/20"
            onClick={() => router.push('/m/verification')}
          >
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Pending Verification
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              {pendingCount}
            </Badge>
          </Button>
        )}
      </div>
      
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex-shrink-0 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeView === tab.id
                ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const ProcessedAnalytics = ({
  data,
  onCountryChange,
  onTimeRangeChange,
  selectedCountry,
  selectedTimeRange,
  countries,
  loading,
  bestPerformer
}: {
  data: any[]
  onCountryChange: (country: string) => void
  onTimeRangeChange: (timeRange: string) => void
  selectedCountry: string
  selectedTimeRange: string
  countries: string[]
  loading?: boolean
  bestPerformer?: string
}) => {
  const handleTimeIntervalChange = async (interval: string) => {
    await onTimeRangeChange(interval)
  }

  const handleCountryChange = async (country: string) => {
    await onCountryChange(country)
  }

  return (
    <div className="px-3 space-y-3">
      <MobileAnalyticsCard
        title="Total Amount Processed"
        icon={<CurrencyDollarIcon className="h-4 w-4 text-violet-600" />}
        data={data}
        loading={loading || false}
        timeInterval={selectedTimeRange}
        onTimeIntervalChange={handleTimeIntervalChange}
        selectedCountry={selectedCountry}
        onCountryChange={handleCountryChange}
        countries={countries}
        bestPerformer={bestPerformer}
      >
        <MobileRevenueChart
          height={180}
          showFilters={false}
          selectedCountry={selectedCountry}
          selectedTimeRange={selectedTimeRange}
        />
      </MobileAnalyticsCard>
    </div>
  )
}

const CountriesAnalytics = ({ data, loading, bestPerformer }: { data: any[], loading?: boolean, bestPerformer?: string }) => {
  const topCountries = data.slice(0, 4)

  return (
    <div className="px-3 space-y-3">
      <MobileAnalyticsCard
        title="Countries Performance"
        icon={<GlobeAltIcon className="h-4 w-4 text-violet-600" />}
        data={data}
        loading={loading || false}
        bestPerformer={bestPerformer}
      >
        <div className="space-y-2">
          {topCountries.map((country, index) => (
            <div key={country.country_code || index} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal text-card-foreground truncate">
                  {country.country_name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">{country.payment_count || 0} transactions</p>
                <p className="text-xs text-muted-foreground">{parseFloat(country.success_rate || '0').toFixed(0)}% success rate</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-normal text-card-foreground">
                  {country.currency_code} {parseFloat(country.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileAnalyticsCard>
    </div>
  )
}

const MethodsAnalytics = ({ data, loading, bestPerformer }: { data: any[], loading?: boolean, bestPerformer?: string }) => {
  const topMethods = data.slice(0, 4)

  return (
    <div className="px-3 space-y-3">
      <MobileAnalyticsCard
        title="Payment Methods Performance"
        icon={<CreditCardIcon className="h-4 w-4 text-violet-600" />}
        data={data}
        loading={loading || false}
        bestPerformer={bestPerformer}
      >
        <div className="space-y-2">
          {topMethods.map((method, index) => (
            <div key={method.payment_method || index} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal text-card-foreground truncate">
                  {method.payment_method || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">{method.transaction_count || 0} transactions</p>
                <p className="text-xs text-muted-foreground">{parseFloat(method.success_rate || '0').toFixed(0)}% success rate</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-normal text-card-foreground">
                  {method.currency_code} {parseFloat(method.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileAnalyticsCard>
    </div>
  )
}

const ProductsAnalytics = ({ data, loading, bestPerformer }: { data: any[], loading?: boolean, bestPerformer?: string }) => {
  const topProducts = data.slice(0, 4)

  return (
    <div className="px-3 space-y-3">
      <MobileAnalyticsCard
        title="Product Performance"
        icon={<DocumentTextIcon className="h-4 w-4 text-violet-600" />}
        data={data}
        loading={loading || false}
        bestPerformer={bestPerformer}
      >
        <div className="space-y-2">
          {topProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal text-card-foreground truncate">
                  {product.title || 'Unknown Product'}
                </p>
                <p className="text-xs text-muted-foreground">{product.payment_count || 0} sales</p>
                <p className="text-xs text-muted-foreground">{parseFloat(product.conversion_rate || '0').toFixed(2)}% conversion rate</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-normal text-card-foreground">
                  {product.currency_code} {parseFloat(product.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileAnalyticsCard>
    </div>
  )
}

const TransactionHistorySection = ({ transactions, loading }: { transactions: Transaction[], loading: boolean }) => {
  const router = useRouter()

  const handleVerifyPayment = async (paymentId: string, newStatus: 'completed' | 'failed') => {
    // This is a read-only view for dashboard, so we don't need verification functionality
    console.log('Payment verification not available in dashboard view')
  }

  return (
    <div className="px-3 pb-16">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Transaction History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/m/transactions')}
          className="text-xs h-7 font-normal"
        >
          View All Transaction
        </Button>
      </div>
      
      <div className="space-y-2">
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-muted-foreground">Loading transactions...</div>
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => (
            <PaymentVerificationCard
              key={transaction.fullId}
              payment={{
                id: transaction.fullId,
                customer_name: transaction.customer,
                customer_email: transaction.customerEmail,
                amount: transaction.amount,
                currency: transaction.currency,
                payment_method: transaction.method,
                country: transaction.country,
                status: transaction.status as 'completed' | 'failed' | 'pending' | 'pending_verification',
                created_at: transaction.date
              }}
              onVerifyPayment={handleVerifyPayment}
            />
          ))
        ) : (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">No transactions found</p>
              <p className="text-xs text-muted-foreground">Start by creating your first checkout link</p>
              <Button size="sm" className="mt-2" asChild>
                <Link href="/m/checkout-links/create">Create Checkout Link</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MobileDashboardPage() {
  const [activeView, setActiveView] = useState<AnalyticsView>('processed')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [selectedTimeRange, setSelectedTimeRange] = useState("30")
  const [countries, setCountries] = useState<string[]>([])
  const [bestPerformers, setBestPerformers] = useState({
    country: '',
    method: '',
    product: ''
  })
  const router = useRouter()

  const fetchDashboardData = async (showAnalyticsLoading = false) => {
    try {
      if (showAnalyticsLoading) {
        setAnalyticsLoading(true)
      } else {
        setLoading(true)
      }
      
      const [
        totalPaymentsResult,
        revenueResult,
        geographicResult,
        paymentMethodResult,
        checkoutLinkResult,
        transactionStatusResult,
        pendingVerificationResult
      ] = await Promise.all([
        getTotalPaymentsCount(),
        getRevenueAnalytics(),
        getGeographicAnalytics(),
        getPaymentMethodAnalytics(),
        getCheckoutLinkAnalytics(),
        getTransactionStatusAnalytics(),
        getPendingVerificationCount()
      ])

      // Set countries for dropdown
      if (geographicResult.success && geographicResult.data) {
        const countryNames = geographicResult.data.map(item => item.country_name)
        setCountries(['All Countries', ...countryNames])
      }

      // Calculate success rate
      let successRate = 0
      if (transactionStatusResult.success && transactionStatusResult.data) {
        const total = transactionStatusResult.data.reduce((sum, item) => sum + item.count, 0)
        const successful = transactionStatusResult.data.find(item => item.status === 'completed')?.count || 0
        successRate = total > 0 ? (successful / total * 100) : 0
      }

      // Calculate total revenue
      const totalRevenue = revenueResult.success && revenueResult.data
        ? revenueResult.data.reduce((sum, item) => sum + parseFloat(item.total_revenue || '0'), 0)
        : 0

      // Calculate verified transactions (completed transactions)
      const verifiedTransactions = transactionStatusResult.success && transactionStatusResult.data
        ? transactionStatusResult.data.find(item => item.status === 'completed')?.count || 0
        : 0

      // Set best performers
      setBestPerformers({
        country: geographicResult.success && geographicResult.data?.[0]?.country_name || 'No data',
        method: paymentMethodResult.success && paymentMethodResult.data?.[0]?.payment_method || 'No data',
        product: checkoutLinkResult.success && checkoutLinkResult.data?.[0]?.title || 'No products'
      })

      setDashboardData({
        totalPayments: totalPaymentsResult.count || 0,
        totalRevenue,
        bestProduct: checkoutLinkResult.success && checkoutLinkResult.data?.[0]?.title || 'No products',
        bestCountry: geographicResult.success && geographicResult.data?.[0]?.country_name || 'No data',
        successRate: successRate,
        activeCountries: geographicResult.success ? geographicResult.data?.length || 0 : 0,
        revenueData: revenueResult.data || [],
        geographicData: geographicResult.data || [],
        paymentMethodData: paymentMethodResult.data || [],
        checkoutLinkData: checkoutLinkResult.data || [],
        transactionStatusData: transactionStatusResult.data || [],
        pendingVerifications: pendingVerificationResult.count || 0,
        totalProducts: checkoutLinkResult.success ? checkoutLinkResult.data?.length || 0 : 0,
        totalCheckoutLinks: checkoutLinkResult.success ? checkoutLinkResult.data?.length || 0 : 0,
        totalPaymentMethods: paymentMethodResult.success ? paymentMethodResult.data?.length || 0 : 0,
        verifiedTransactions: verifiedTransactions
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setAnalyticsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      const supabase = createClient()
      
      // Get current auth user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get database profile
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', user.email || '')
        .single()

      if (!dbUser) return

      const isSuperAdmin = dbUser.role === 'super_admin' || 
        user.email === 'admin@pxvpay.com' || 
        user.email === 'dev-admin@pxvpay.com' || 
        user.email === 'superadmin@pxvpay.com'

      // Build payments query
      let paymentsQuery = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!isSuperAdmin && dbUser?.id) {
        paymentsQuery = paymentsQuery.eq('merchant_id', dbUser.id)
      }

      const { data: recentPayments } = await paymentsQuery
      
      const formattedPayments: Transaction[] = recentPayments?.map(payment => ({
        id: payment.id || 'N/A',
        fullId: payment.id || 'N/A',
        date: payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        customer: payment.customer_name || payment.customer_email?.split('@')[0] || 'N/A',
        customerEmail: payment.customer_email || '',
        amount: payment.amount && payment.currency ? payment.amount : 0,
        currency: payment.currency || 'USD',
        method: payment.payment_method || 'N/A',
        country: payment.country || 'N/A',
        status: payment.status || 'pending'
      })) || []

      setTransactions(formattedPayments)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    fetchTransactions()
  }, [])

  // Handle filter changes for processed analytics
  const handleCountryChange = async (country: string) => {
    setSelectedCountry(country)
    // Trigger data refresh with new filters
    await fetchDashboardData(true)
  }

  const handleTimeRangeChange = async (timeRange: string) => {
    setSelectedTimeRange(timeRange)
    // Trigger data refresh with new filters
    await fetchDashboardData(true)
  }

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${dashboardData.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon
    },
    {
      title: "Total Transactions",
      value: dashboardData.totalPayments.toString(),
      icon: DocumentChartBarIcon
    },
    {
      title: "Success Rate",
      value: `${dashboardData.successRate.toFixed(0)}%`,
      icon: ArrowTrendingUpIcon
    },
    {
      title: "Active Countries",
      value: dashboardData.activeCountries.toString(),
      icon: GlobeAltIcon
    }
  ]

  const renderAnalyticsContent = () => {
    switch (activeView) {
      case 'countries':
        return (
          <CountriesAnalytics
            data={dashboardData.geographicData}
            loading={analyticsLoading}
            bestPerformer={bestPerformers.country}
          />
        )
      case 'methods':
        return (
          <MethodsAnalytics
            data={dashboardData.paymentMethodData}
            loading={analyticsLoading}
            bestPerformer={bestPerformers.method}
          />
        )
      case 'products':
        return (
          <ProductsAnalytics
            data={dashboardData.checkoutLinkData}
            loading={analyticsLoading}
            bestPerformer={bestPerformers.product}
          />
        )
      case 'transactions':
        return (
          <div className="px-3 space-y-3">
            <MobileAnalyticsCard
              title="Transaction Performance"
              icon={<DocumentChartBarIcon className="h-4 w-4 text-violet-600" />}
              data={dashboardData.transactionStatusData}
              loading={analyticsLoading}
              bestPerformer={`${dashboardData.successRate.toFixed(1)}% success rate`}
            >
              <div className="space-y-2">
                {dashboardData.transactionStatusData.slice(0, 4).map((status, index) => (
                  <div key={status.status || index} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-card-foreground truncate capitalize">
                        {status.status || 'Unknown Status'}
                      </p>
                      <p className="text-xs text-muted-foreground">{status.count || 0} transactions</p>
                      <p className="text-xs text-muted-foreground">{((status.count || 0) / dashboardData.transactionStatusData.reduce((sum, item) => sum + (item.count || 0), 0) * 100).toFixed(1)}% of total</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-normal text-card-foreground">
                        {status.count || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </MobileAnalyticsCard>
          </div>
        )
      case 'others':
        return (
          <div className="px-3 space-y-3">
            <MobileAnalyticsCard
              title="Other Statistics"
              icon={<CubeIcon className="h-4 w-4 text-violet-600" />}
              data={[]}
              loading={analyticsLoading}
              bestPerformer={`${dashboardData.totalProducts + dashboardData.totalPaymentMethods + dashboardData.verifiedTransactions} total items`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal text-card-foreground truncate">
                      Total Products
                    </p>
                    <p className="text-xs text-muted-foreground">Active product templates</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-normal text-card-foreground">
                      {dashboardData.totalProducts}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal text-card-foreground truncate">
                      Payment Methods
                    </p>
                    <p className="text-xs text-muted-foreground">Available payment options</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-normal text-card-foreground">
                      {dashboardData.totalPaymentMethods}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal text-card-foreground truncate">
                      Verified Transactions
                    </p>
                    <p className="text-xs text-muted-foreground">Successfully completed</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-normal text-card-foreground">
                      {dashboardData.verifiedTransactions}
                    </p>
                  </div>
                </div>
              </div>
            </MobileAnalyticsCard>
          </div>
        )
      case 'processed':
      default:
        return (
          <ProcessedAnalytics
            data={dashboardData.revenueData}
            onCountryChange={handleCountryChange}
            onTimeRangeChange={handleTimeRangeChange}
            selectedCountry={selectedCountry}
            selectedTimeRange={selectedTimeRange}
            countries={countries}
            loading={analyticsLoading}
            bestPerformer={`${dashboardData.totalRevenue.toLocaleString()} total processed`}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact */}
      <MobileDashboardHeader pendingCount={dashboardData.pendingVerifications} />

      {/* Stats Cards - Compact spacing */}
      <div className="px-3 py-3">
        <MobileStatsCards />
      </div>

      {/* Platform Analytics Tabs - Compact */}
      <PlatformAnalyticsTabs activeView={activeView} setActiveView={setActiveView} pendingCount={dashboardData.pendingVerifications} />

      {/* Analytics Content - Compact */}
      <div className="mb-4">
        {renderAnalyticsContent()}
      </div>

      {/* Transaction History - Compact */}
      <TransactionHistorySection transactions={transactions} loading={transactionsLoading} />
    </div>
  )
}