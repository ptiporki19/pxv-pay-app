import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RouteGuard } from '@/components/RouteGuard'
import { AdminLayoutClient } from '@/components/AdminLayoutClient'

export const metadata: Metadata = {
  title: 'Merchant Dashboard - PXV Pay',
  description: 'Merchant Dashboard for PXV Pay',
}

// Define the user role type
type UserRole = 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'

export default async function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  let userRole: UserRole = 'registered_user'
  let isSuperAdmin = false
  let userName = 'User'
  let userEmail = ''

  if (session?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    userRole = (profile?.role as UserRole) || 'registered_user'
    isSuperAdmin = userRole === 'super_admin'
    userName = profile?.email?.split('@')[0] || session.user.email?.split('@')[0] || 'User'
    userEmail = profile?.email || session.user.email || ''
  }

  return (
    <RouteGuard>
      <AdminLayoutClient
        userRole={userRole}
        isSuperAdmin={isSuperAdmin}
        userName={userName}
        userEmail={userEmail}
      >
        {children}
      </AdminLayoutClient>
    </RouteGuard>
  )
} 