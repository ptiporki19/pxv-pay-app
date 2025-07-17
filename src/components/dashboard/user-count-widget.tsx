'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from 'lucide-react'
import { getUserCount } from '@/lib/actions/dashboard-stats'

export function UserCountWidget() {
  const [userCount, setUserCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserCount = async () => {
    try {
      console.log('🔄 Client: Calling server action for user count...')
      setLoading(true)
      setError(null)

      const result = await getUserCount()
      
      console.log('📡 Client: Server action result:', result)

      if (result.success) {
        console.log('✅ Client: Success! User count:', result.count)
        setUserCount(result.count)
        setError(null)
      } else {
        console.error('❌ Client: Server action failed:', result.error)
        setError(result.error)
        setUserCount(0)
      }

    } catch (err) {
      console.error('💥 Client: Exception calling server action:', err)
      setError(`Client error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setUserCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserCount()
  }, [])

  return (
    <Card className="transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? '...' : userCount}
        </div>
        <p className="text-xs text-muted-foreground">
          Registered users on platform
        </p>
        {error && (
          <p className="text-xs text-red-500 mt-1">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 