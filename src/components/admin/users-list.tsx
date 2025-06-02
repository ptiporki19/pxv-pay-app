"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Crown, Shield, User, Mail, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useRealtimeUsers } from '@/hooks/use-realtime-users'
import Link from 'next/link'

interface User {
  id: string
  email: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
}

export function UsersList() {
  const { users: allUsers, isLoading, setUsers } = useRealtimeUsers()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Check super admin access on mount
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
        return
      }

      // Check super admin status
      const userEmail = session.user.email || ''
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const isSuperAdminEmail = userEmail === 'admin@pxvpay.com' || 
                                userEmail === 'dev-admin@pxvpay.com' || 
                                userEmail === 'superadmin@pxvpay.com'
      const isSuperAdminRole = userProfile?.role === 'super_admin'
      
      if (!isSuperAdminRole && !isSuperAdminEmail) {
        router.push('/dashboard')
        return
      }
    }

    checkAccess()
  }, [supabase, router])

  // Filter users based on search query
  const users = searchQuery.trim() 
    ? allUsers.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allUsers

  // Sync users from auth table to public users table
  const syncUsersFromAuth = async () => {
    setIsSyncing(true)
    try {
      console.log('🔄 Attempting to sync users from auth...')
      
      // Call the simplified API
      const response = await fetch('/api/sync-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Users synced successfully:', result)
        toast({
          title: "Success",
          description: `Synced ${result.insertedUsers} users successfully`
        })
        
        // Refresh the list by re-fetching
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setUsers(data)
        }
      } else {
        console.error('❌ Failed to sync users:', result)
        toast({
          title: "Error",
          description: result.error || "Failed to sync users",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error syncing users:', error)
      toast({
        title: "Error",
        description: "Failed to sync users",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast({ title: "Success", description: "User role updated successfully" })
      
      // Update local state
      setUsers(allUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error("Error updating role:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update role", 
        variant: "destructive" 
      })
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast({ title: "Success", description: `User ${action}d successfully` })
      
      // Update local state
      setUsers(allUsers.map(user => 
        user.id === userId ? { ...user, active: newStatus } : user
      ))
    } catch (error) {
      console.error("Error updating status:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update status", 
        variant: "destructive" 
      })
    }
  }

  // Role badge color helper
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-black text-white'
      case 'subscriber':
        return 'bg-blue-100 text-blue-800'
      case 'registered_user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Status badge color helper
  const getStatusBadgeClass = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users and their permissions.</p>
        </div>
        <Button onClick={syncUsersFromAuth} variant="outline" disabled={isSyncing}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isSyncing ? 'Syncing...' : 'Sync Users'}
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
          <div className="w-1/3">User</div>
          <div className="w-1/6 text-center">Role</div>
          <div className="w-1/6 text-center">Status</div>
          <div className="w-1/4">Joined</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    {user.role === 'super_admin' ? (
                      <Crown className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
              <div className="w-1/6 text-center">
                <Badge className={getRoleBadgeClass(user.role)}>
                  {user.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                  {user.role === 'super_admin' ? 'Super Admin' : 
                   user.role === 'subscriber' ? 'Subscriber' : 'User'}
                </Badge>
              </div>
              <div className="w-1/6 text-center">
                <Badge className={getStatusBadgeClass(user.active)}>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="w-1/4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(user.created_at)}
                </div>
              </div>
              <div className="w-1/12 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.id}/profile`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'registered_user')}>
                      <User className="mr-2 h-4 w-4" />
                      Make User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'subscriber')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Make Subscriber
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'super_admin')}>
                      <Crown className="mr-2 h-4 w-4" />
                      Make Super Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusToggle(user.id, user.active)}
                      className={user.active ? 'text-red-600' : 'text-green-600'}
                    >
                      {user.active ? '🚫 Deactivate' : '✅ Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4">
              <User className="h-12 w-12 text-gray-400" />
              <div>
                <p className="font-medium">No users found</p>
                <p className="text-sm">Users will appear here once they register or are synced.</p>
              </div>
              <Button onClick={syncUsersFromAuth} variant="outline" disabled={isSyncing}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSyncing ? 'Syncing...' : 'Sync Users from Auth'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 