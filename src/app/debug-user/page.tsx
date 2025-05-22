import { createClient } from '@/lib/supabase/server'

export default async function DebugUserPage() {
  const supabase = await createClient()
  
  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Get user profile if session exists
  let profile = null
  let profileError = null
  
  if (session?.user) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    profile = data
    profileError = error
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Debug Information</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(
              session 
                ? {
                    user_id: session.user.id,
                    email: session.user.email,
                    expires_at: session.expires_at,
                  }
                : null,
              null,
              2
            )}
          </pre>
          {sessionError && (
            <p className="text-red-600 mt-2">Session Error: {sessionError.message}</p>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">User Profile</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
          {profileError && (
            <p className="text-red-600 mt-2">Profile Error: {profileError.message}</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Logged In:</strong> {session ? 'Yes' : 'No'}</p>
            <p><strong>User Email:</strong> {session?.user?.email || 'None'}</p>
            <p><strong>User Role:</strong> {profile?.role || 'None'}</p>
            <p><strong>Is Super Admin:</strong> {profile?.role === 'super_admin' ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Expected Behavior</h2>
          <p>If role === 'super_admin', user should be redirected to /super-admin</p>
          <p>If role !== 'super_admin', user should stay on /dashboard</p>
        </div>
      </div>
    </div>
  )
} 