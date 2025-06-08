'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError({ type: 'session', error: sessionError })
          return
        }
        
        setAuthState(session)
        
        if (session?.user) {
          // Try to fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()
          
          if (profileError) {
            setError({ type: 'profile', error: profileError })
          } else {
            setUserProfile(profile)
          }
        }
      } catch (err) {
        setError({ type: 'general', error: err })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">User Profile</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>
        
        {error && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-red-600">Error</h2>
            <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Analysis</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authenticated: {authState?.user ? '✅ Yes' : '❌ No'}</li>
            <li>User Email: {authState?.user?.email || 'None'}</li>
            <li>Profile Found: {userProfile ? '✅ Yes' : '❌ No'}</li>
            <li>User Role: {userProfile?.role || 'None'}</li>
            <li>Is Super Admin: {userProfile?.role === 'super_admin' ? '✅ Yes' : '❌ No'}</li>
            <li>Expected Redirect: {userProfile?.role === 'super_admin' ? '/super-admin' : '/dashboard'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 