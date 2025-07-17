'use client'

import { Suspense, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { 
  TrendingUp, 
  BarChart3, 
  Globe,
  CreditCard,
  Link as LinkIcon,
  Activity,
  ChevronRight,
  ExternalLink,
  Loader2,
  ShoppingBag
} from 'lucide-react'
import { 
  CubeIcon as Package,
  ClockIcon as Clock,
  LinkIcon as LinkHero
} from '@heroicons/react/24/solid'
import { InteractiveRevenueChart } from './interactive-revenue-chart'
import { InteractiveGeographicBarChart } from './interactive-geographic-bar-chart'
import { InteractivePaymentMethodsBarChart } from './interactive-payment-methods-bar-chart'
import { InteractiveTransactionStatusBarChart } from './interactive-transaction-status-bar-chart'
import { ProductPerformance } from './checkout-links-table'
import { AnalyticsTransactionHistory } from './analytics-transaction-history'
import { 
  TotalRevenueWidget,
  RevenueAnalyticsWidget,
  GeographicAnalyticsWidget,
  TransactionStatusAnalyticsWidget
} from './analytics-widgets'
import { getGeographicAnalytics, type GeographicAnalytics } from '@/lib/actions/analytics-data-simple'
import { getProductsCount, getPendingVerificationCount, getCheckoutLinksCount } from '@/lib/actions/dashboard-stats'

type AnalyticsView = 'revenue' | 'geographic' | 'payment-methods' | 'checkout-links' | 'transactions'

interface AnalyticsDashboardProps {
  userData?: any
}

// Color mapping for different countries
const countryColors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-yellow-500',
  'bg-purple-500',
  'bg-red-500'
]

function TopCountriesWidget({ setActiveView }: { setActiveView: (view: AnalyticsView) => void }) {
  const [countries, setCountries] = useState<GeographicAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Order analytics states
  const [productsCount, setProductsCount] = useState(0)
  const [checkoutLinksCount, setCheckoutLinksCount] = useState(0)
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0)
  const [orderStatsLoading, setOrderStatsLoading] = useState(true)

  useEffect(() => {
    async function fetchCountries() {
      try {
        setLoading(true)
        const result = await getGeographicAnalytics()
        if (result.success && result.data) {
          // Get top 3 countries for fixed display
          setCountries(result.data.slice(0, 3))
        } else {
          setError(result.error || 'Failed to fetch countries')
        }
      } catch (err) {
        setError('An error occurred while fetching countries')
      } finally {
        setLoading(false)
      }
    }

    async function fetchOrderStats() {
      try {
        setOrderStatsLoading(true)
        const [productsResult, checkoutLinksResult, pendingResult] = await Promise.all([
          getProductsCount(),
          getCheckoutLinksCount(),
          getPendingVerificationCount()
        ])
        
        setProductsCount(productsResult.count || 0)
        setCheckoutLinksCount(checkoutLinksResult.count || 0)
        setPendingVerificationsCount(pendingResult.count || 0)
      } catch (err) {
        console.error('Failed to fetch order stats:', err)
      } finally {
        setOrderStatsLoading(false)
      }
    }

    fetchCountries()
    fetchOrderStats()
  }, [])

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-0">
          <Tabs defaultValue="countries" className="h-full">
            <div className="px-6 pt-6 pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="countries">Top Countries</TabsTrigger>
                <TabsTrigger value="orders">Order Analytics</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex items-center justify-center h-24 px-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <Tabs defaultValue="countries" className="h-full">
          <div className="px-6 pt-6 pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="countries">Top Countries</TabsTrigger>
              <TabsTrigger value="orders">Order Analytics</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="countries" className="px-6 pb-6 mt-0">
            {error || !countries.length ? (
              <div className="flex items-center justify-center h-24">
                <div className="text-center text-muted-foreground text-xs">
                  {error || 'No country data available'}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  {countries.map((country, index) => (
                    <div key={country.country_name} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-medium font-roboto truncate" title={country.country_name}>
                          {country.country_name}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-roboto text-violet-600 flex-shrink-0 ml-2">
                        {country.currency_code || 'USD'} {parseFloat(country.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="orders" className="px-6 pb-6 mt-0">
            {orderStatsLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                  <span className="text-xs text-muted-foreground">Loading stats...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package className="h-3 w-3 text-violet-600 flex-shrink-0" />
                    <span className="text-xs font-medium font-roboto truncate">
                      Total Products
                    </span>
                  </div>
                  <span className="text-xs font-bold font-roboto text-violet-600 flex-shrink-0 ml-2">
                    {productsCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <LinkHero className="h-3 w-3 text-violet-600 flex-shrink-0" />
                    <span className="text-xs font-medium font-roboto truncate">
                      Checkout Links
                    </span>
                  </div>
                  <span className="text-xs font-bold font-roboto text-violet-600 flex-shrink-0 ml-2">
                    {checkoutLinksCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Clock className="h-3 w-3 text-violet-600 flex-shrink-0" />
                    <span className="text-xs font-medium font-roboto truncate">
                      Pending Verifications
                    </span>
                  </div>
                  <span className="text-xs font-bold font-roboto text-violet-600 flex-shrink-0 ml-2">
                    {pendingVerificationsCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard({ userData }: AnalyticsDashboardProps) {
  const [activeView, setActiveView] = useState<AnalyticsView>('revenue')

  const renderMainChart = () => {
    switch (activeView) {
      case 'geographic':
        return (
          <Suspense fallback={
            <Card className="h-[500px]">
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-muted-foreground">Loading chart...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <InteractiveGeographicBarChart />
          </Suspense>
        )
      case 'payment-methods':
        return (
          <Suspense fallback={
            <Card className="h-[500px]">
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-muted-foreground">Loading chart...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <InteractivePaymentMethodsBarChart />
          </Suspense>
        )
      case 'transactions':
        return (
          <Suspense fallback={
            <Card className="h-[500px]">
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-muted-foreground">Loading chart...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <InteractiveTransactionStatusBarChart />
          </Suspense>
        )
      case 'checkout-links':
        return (
          <Suspense fallback={
            <Card className="h-[500px]">
              <CardContent className="h-full flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-muted-foreground">Loading products...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <ProductPerformance />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={
            <Card className="h-[500px]">
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-muted-foreground">Loading chart...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <InteractiveRevenueChart />
          </Suspense>
        )
    }
  }

  const getAnalyticsTitle = () => {
    switch (activeView) {
      case 'revenue':
        return 'Revenue Analytics'
      case 'geographic':
        return 'Geographic Analytics'
      case 'payment-methods':
        return 'Payment Methods Analytics'
      case 'transactions':
        return 'Transaction Stats Analytics'
      case 'checkout-links':
        return 'Product Performance Analytics'
      default:
        return 'Revenue Analytics'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Metrics - 4 Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={
          <Card className="h-[140px] animate-pulse">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </CardContent>
          </Card>
        }>
          <TotalRevenueWidget />
        </Suspense>
        <Suspense fallback={
          <Card className="h-[140px] animate-pulse">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </CardContent>
          </Card>
        }>
          <RevenueAnalyticsWidget />
        </Suspense>
        <Suspense fallback={
          <Card className="h-[140px] animate-pulse">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </CardContent>
          </Card>
        }>
          <GeographicAnalyticsWidget />
        </Suspense>
        <Suspense fallback={
          <Card className="h-[140px] animate-pulse">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </CardContent>
          </Card>
        }>
          <TransactionStatusAnalyticsWidget />
        </Suspense>
      </div>

      {/* Main Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Large Interactive Chart - Takes 3 columns */}
        <div className="lg:col-span-3">
          {renderMainChart()}
        </div>

        {/* Analytics Navigation - Takes 1 column */}
        <div className="flex flex-col gap-6 h-[500px]">
          {/* Analytics Navigation */}
          <Card className="h-[280px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold tracking-tight text-gray-900 dark:text-white font-roboto">Plateform Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button 
                variant={activeView === 'revenue' ? 'default' : 'outline'} 
                className="w-full justify-between font-roboto py-2 h-auto" 
                onClick={() => setActiveView('revenue')}
              >
                <span>Revenue Analytics</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant={activeView === 'geographic' ? 'default' : 'outline'} 
                className="w-full justify-between font-roboto py-2 h-auto" 
                onClick={() => setActiveView('geographic')}
              >
                <span>Geographic Analytics</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant={activeView === 'payment-methods' ? 'default' : 'outline'} 
                className="w-full justify-between font-roboto py-2 h-auto" 
                onClick={() => setActiveView('payment-methods')}
              >
                <span>Payment Methods</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant={activeView === 'checkout-links' ? 'default' : 'outline'} 
                className="w-full justify-between font-roboto py-2 h-auto" 
                onClick={() => setActiveView('checkout-links')}
              >
                <span>Product Performance</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant={activeView === 'transactions' ? 'default' : 'outline'} 
                className="w-full justify-between font-roboto py-2 h-auto" 
                onClick={() => setActiveView('transactions')}
              >
                <span>Transaction Stats</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Top Performing Countries - Fixed height */}
          <div className="h-[210px]">
            <TopCountriesWidget setActiveView={setActiveView} />
          </div>
        </div>
      </div>

      {/* Recent Transactions - Always visible */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-roboto">Transaction History</CardTitle>
              <CardDescription className="text-base font-medium text-gray-600 dark:text-gray-300 font-roboto">
                Monitor all payment transactions and their status
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2 font-bold font-roboto" asChild>
              <Link href="/transactions">
                <ExternalLink className="h-4 w-4" />
                View All Transactions
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-roboto font-semibold text-sm">
                <div className="w-[120px]">Transaction ID</div>
                <div className="w-[100px]">Date</div>
                <div className="w-[160px]">Customer</div>
                <div className="w-[100px]">Amount</div>
                <div className="w-[120px]">Method</div>
                <div className="w-[80px]">Country</div>
                <div className="w-[100px] text-right">Status</div>
              </div>
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-base font-bold font-roboto">Loading transactions...</span>
                </div>
              </div>
            </div>
          }>
            <AnalyticsTransactionHistory />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 