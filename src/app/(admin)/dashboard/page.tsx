import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  BellIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPendingVerificationCount } from '@/lib/actions/dashboard-stats'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { FloatingChatWidgetWrapper } from '@/components/FloatingChatWidgetWrapper'

export const metadata: Metadata = {
  title: 'Dashboard - PXV Pay',
  description: 'Analytics and insights for your payment system',
}

export default async function AnalyticsPage() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Default values in case fetch fails
  let session = null
  let userData = null
  
  try {
    // Get user session and profile
    const { data } = await supabase.auth.getSession()
    session = data.session
    const userId = session?.user?.id
    
    if (userId) {
      // Fetch user data using email for reliable lookup
      const { data: userResult } = await supabase
        .from('users')
        .select('*')
        .eq('email', session?.user?.email || '')
        .single()
      
      userData = userResult
    }
  } catch (error) {
    console.error("Error loading analytics data:", error)
  }

  // Fetch pending verification count
  const { count: pendingCount } = await getPendingVerificationCount()

  return (
    <div className="flex flex-col gap-6">
      {/* Professional Hero Section */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gray-900 dark:text-white font-roboto">Dashboard</h1>
        <div className="flex items-center justify-between">
          <p className="text-lg lg:text-xl font-medium text-gray-600 dark:text-gray-300 leading-relaxed font-roboto">
            Welcome back, <span className="font-bold text-violet-600 dark:text-violet-400">{userData?.email ? userData.email.split('@')[0] : 'User'}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button className="gap-2 font-bold violet-gradient hover:violet-gradient-hover font-roboto px-6 py-2" asChild>
              <Link href="/checkout/create">
                <Plus className="h-4 w-4" />
                Create Checkout Link
              </Link>
            </Button>
            <Button variant="outline" className="gap-2 font-bold font-roboto px-6 py-2 relative" asChild>
              <Link href="/verification">
                <BellIcon className="h-4 w-4" />
                Pending Verifications
                {pendingCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white p-0">
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Component */}
      <AnalyticsDashboard userData={userData} />

      {/* Floating Chat Widget - Only for merchants (not super admins) */}
      {userData?.role !== 'super_admin' && (
        <FloatingChatWidgetWrapper />
      )}
    </div>
  )
} 