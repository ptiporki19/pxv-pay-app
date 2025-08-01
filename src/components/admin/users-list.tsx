"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Crown, Shield, User, Mail, Calendar, Eye, UserPlus, Filter, ArrowDownUp } from "lucide-react"
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
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [roleFilter, setRoleFilter] = useState("all")

  // Check super admin access on mount
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
        return
      }

      // Check super admin status (ONLY database role)
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const isSuperAdminRole = userProfile?.role === 'super_admin'
      
      if (!isSuperAdminRole) {
        router.push('/dashboard')
        return
      }
    }

    checkAccess()
  }, [supabase, router])

  // Filter users based on search query and role filter
  const users = allUsers.filter(user => {
    // Apply search filter
    const searchMatch = !searchQuery.trim() || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply role filter
    const roleMatch = roleFilter === 'all' || user.role === roleFilter
    
    return searchMatch && roleMatch
  })

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

      console.log('📋 Raw response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      let result
      try {
        const responseText = await response.text()
        console.log('📋 Raw response text:', responseText)
        
        if (responseText.trim() === '') {
          throw new Error('Empty response from server')
        }
        
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError)
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`)
      }

      console.log('📋 Parsed sync API response:', result)

      if (response.ok && result && result.success !== false) {
        console.log('✅ Users synced successfully:', result)
        toast({
          title: "Success",
          description: result.message || `Synced ${result.insertedUsers || 0} users successfully`
        })
        
        // Refresh the list by re-fetching
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setUsers(data)
          console.log(`🔄 Refreshed users list: ${data.length} users`)
        } else {
          console.warn('⚠️ Failed to refresh users list:', error)
        }
      } else {
        const errorMessage = result?.error || result?.details || `HTTP ${response.status}: ${response.statusText}` || 'Failed to sync users'
        console.error('❌ Failed to sync users:', {
          response: {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText
          },
          result
        })
        
        // Show more detailed error message
        let userFriendlyMessage = errorMessage
        if (response.status === 401) {
          userFriendlyMessage = 'Authentication failed. Please try signing in again.'
        } else if (response.status === 403) {
          userFriendlyMessage = 'You don\'t have permission to sync users.'
        } else if (response.status === 500) {
          userFriendlyMessage = 'Server error occurred. Please try again later.'
        }
        
        toast({
          title: "Error",
          description: userFriendlyMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('💥 Error syncing users:', error)
      toast({
        title: "Error",
        description: `Failed to sync users: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          <h1 className="text-3xl font-bold tracking-tight font-roboto">User Management</h1>
          <p className="text-muted-foreground">Manage users and their permissions.</p>
        </div>
      </div>

      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
              className="w-full bg-background pl-8 h-11 font-roboto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] h-11 font-roboto">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-roboto">All Roles</SelectItem>
              <SelectItem value="super_admin" className="font-roboto">Super Admin</SelectItem>
              <SelectItem value="registered_user" className="font-roboto">Registered User</SelectItem>
              <SelectItem value="subscriber" className="font-roboto">Subscriber</SelectItem>
              <SelectItem value="free_user" className="font-roboto">Free User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={syncUsersFromAuth} 
            disabled={isSyncing} 
            variant="outline" 
            className="h-11 font-roboto"
          >
            {isSyncing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                Syncing...
              </>
            ) : (
              <>
                <ArrowDownUp className="mr-2 h-4 w-4" />
                Sync Users
              </>
            )}
          </Button>
          <Link href="/users/create">
            <Button className="h-11 font-roboto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
          <div className="w-[200px]">User</div>
          <div className="w-[120px] text-center">Role</div>
          <div className="w-[100px] text-center">Status</div>
          <div className="w-[120px]">Joined</div>
          <div className="w-[100px] text-right">Actions</div>
        </div>
        
        {/* Table Body */}
        {isLoading ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            <div className="text-base font-medium font-roboto">Loading users...</div>
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div className="w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    {user.role === 'super_admin' ? (
                      <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 font-roboto">{user.email}</p>
                    <p className="text-xs text-gray-500 font-roboto">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
              <div className="w-[120px] text-center">
                <Badge className={cn(
                  "font-roboto",
                  user.role === 'super_admin' && 'bg-black text-white dark:bg-gray-100 dark:text-black',
                  user.role === 'subscriber' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
                  user.role === 'registered_user' && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                )}>
                  {user.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                  {user.role === 'super_admin' ? 'Super Admin' : 
                   user.role === 'subscriber' ? 'Subscriber' : 'User'}
                </Badge>
              </div>
              <div className="w-[100px] text-center">
                <Badge className={cn(
                  "font-roboto",
                  user.active 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                )}>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="w-[120px]">
                <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 font-roboto">
                  <Calendar className="h-3 w-3" />
                  {formatDate(user.created_at)}
                </div>
              </div>
              <div className="w-[100px] text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.id}/profile`} className="font-roboto">
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'registered_user')} className="font-roboto">
                      <User className="mr-2 h-4 w-4" />
                      Make User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'subscriber')} className="font-roboto">
                      <Shield className="mr-2 h-4 w-4" />
                      Make Subscriber
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'super_admin')} className="font-roboto">
                      <Crown className="mr-2 h-4 w-4" />
                      Make Super Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusToggle(user.id, user.active)}
                      className={cn(
                        "font-roboto",
                        user.active ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {user.active ? '🚫 Deactivate' : '✅ Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4">
              <User className="h-12 w-12 text-gray-400" />
              <div>
                <p className="font-medium font-roboto">No users found</p>
                <p className="text-sm font-roboto">Users will appear here once they register or are synced.</p>
              </div>
              <Button onClick={syncUsersFromAuth} variant="outline" disabled={isSyncing} className="font-roboto">
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