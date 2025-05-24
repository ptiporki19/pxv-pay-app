import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Shield, 
  Settings, 
  ArrowRight,
  Crown,
  Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { UserCountWidget } from '@/components/dashboard/user-count-widget'

export const metadata: Metadata = {
  title: 'Super Admin Dashboard - PXV Pay',
  description: 'Super Admin central control center for PXV Pay platform',
}

export default async function SuperAdminDashboard() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Get user session and redirect if not authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    // Let the RouteGuard component handle the redirect
    return null
  }

  // Get user profile including role and email for super admin check
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check if user is super admin (using both role and direct email check)
  const userEmail = session.user.email || ''
  const isSuperAdminEmail = userEmail === 'admin@pxvpay.com' || 
                            userEmail === 'dev-admin@pxvpay.com' || 
                            userEmail === 'superadmin@pxvpay.com'
  const isSuperAdminRole = profile?.role === 'super_admin'
  
  if (!isSuperAdminRole && !isSuperAdminEmail) {
    // Let the RouteGuard component handle the redirect
    return null
  }

  const userName = profile?.email?.split('@')[0] || 'Super Admin'

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section with Super Admin identification */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black dark:bg-white">
            <Crown className="h-6 w-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Control Center</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{userName}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-black text-white dark:bg-white dark:text-black border-black dark:border-white">
            <Crown className="h-3 w-3 mr-1" />
            Super Administrator
          </Badge>
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <Activity className="h-3 w-3 mr-1" />
            Full Platform Access
          </Badge>
        </div>
      </div>

      {/* Test: Single User Count Widget */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Stats (Testing)</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <UserCountWidget />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Testing single widget with real data from Supabase
        </p>
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Platform Management</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
          {/* User Management Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-2 hover:border-black dark:hover:border-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription>Manage all platform users and their permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                View, activate, deactivate, and manage user roles across the platform. Monitor user activity and maintain security.
              </p>
              <Button asChild className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <Link href="/users" className="flex items-center justify-center gap-2">
                  Access User Management
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Website Content (Blog) Management Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-2 hover:border-black dark:hover:border-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Website Content</CardTitle>
                  <CardDescription>Manage blog posts and website content</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Create, edit, and publish blog posts. Manage all website content that's visible to the public and merchants.
              </p>
              <Button asChild className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <Link href="/blog-management" className="flex items-center justify-center gap-2">
                  Manage Content
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Audit Logs Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-2 hover:border-black dark:hover:border-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Audit Logs</CardTitle>
                  <CardDescription>Monitor all platform activities and changes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Track all administrative actions, user activities, and system changes for security and compliance monitoring.
              </p>
              <Button asChild className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <Link href="/audit-logs" className="flex items-center justify-center gap-2">
                  View Audit Logs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Secondary Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          
          {/* Platform Settings */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle className="text-base">Platform Settings</CardTitle>
                  <CardDescription>Configure global platform settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" asChild className="w-full">
                <Link href="/settings">
                  Configure Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Payment Verification */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle className="text-base">Payment Verification</CardTitle>
                  <CardDescription>Review pending payment verifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" asChild className="w-full">
                <Link href="/verification">
                  Review Payments
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
} 