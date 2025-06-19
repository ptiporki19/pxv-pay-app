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
        
        // Use the API endpoint that uses service role
        const response = await fetch('/api/users/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        } else {
          console.error('Failed to fetch users from API')
          setUsers([])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
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