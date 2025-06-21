"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

interface User {
  id: string
  email: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
}

export function useRealtimeUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch using API instead of direct database query
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Fetching users from API...')
        
        // Use the API endpoint that uses service role
        const response = await fetch('/api/users/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📋 API Response:', {
            success: data.success,
            count: data.count,
            keyType: data.keyType,
            hasUsers: Array.isArray(data.users),
            userCount: data.users?.length || 0
          })
          
          if (data.users && Array.isArray(data.users)) {
            setUsers(data.users)
            console.log(`✅ Fetched ${data.users.length} users successfully`)
          } else {
            console.warn('⚠️ API returned invalid user data structure')
            setUsers([])
          }
        } else {
          console.error('❌ Failed to fetch users from API:', {
            status: response.status,
            statusText: response.statusText
          })
          
          // Try to parse error response
          try {
            const errorData = await response.json()
            console.error('❌ API Error details:', errorData)
          } catch (e) {
            console.error('❌ Could not parse error response')
          }
          
          setUsers([])
        }
      } catch (error) {
        console.error('💥 Exception fetching users:', error)
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()

    // Set up real-time subscription for changes
    const channel = supabase
      .channel('users-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('🔄 Real-time user change:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              const newUser = payload.new as User
              setUsers(prev => [newUser, ...prev])
              toast({
                title: "New User Registered",
                description: `${newUser.email} just joined the platform!`,
              })
              break
              
            case 'UPDATE':
              const updatedUser = payload.new as User
              setUsers(prev => prev.map(user => 
                user.id === updatedUser.id ? updatedUser : user
              ))
              break
              
            case 'DELETE':
              const deletedUser = payload.old as User
              setUsers(prev => prev.filter(user => user.id !== deletedUser.id))
              break
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return {
    users,
    isLoading,
    setUsers // Allow manual updates
  }
} 