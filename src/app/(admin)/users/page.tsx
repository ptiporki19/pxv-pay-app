import { Metadata } from 'next'
import Link from 'next/link'
import { PlusCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimpleUserActions } from '@/components/SimpleUserActions'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Users - PXV Pay',
  description: 'Manage users in your payment system',
}

export default async function UsersPage() {
  // Create a simple array to hold user data
  let userData: any[] = []
  
  try {
    // Create the admin client inside the component function
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Simply query all users directly with admin privileges
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log("Users query result:", { count: users?.length, error })
    
    if (error) {
      console.error("Error fetching users:", error)
    } else if (users && users.length > 0) {
      // Also get auth user data for more information like last sign in
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.error("Error fetching auth users:", authError)
      }
      
      // Create a lookup map for auth users
      const authUserMap = new Map()
      if (authUsers && authUsers.users) {
        authUsers.users.forEach((user: any) => {
          authUserMap.set(user.id, user)
        })
      }
      
      // Map users to a simpler format
      userData = users.map((user: any) => {
        const authUser = authUserMap.get(user.id)
        
        return {
          id: user.id,
          name: user.email?.split('@')[0] || 'Unknown User',
          email: user.email,
          role: user.role || 'registered_user',
          status: user.active === false ? 'inactive' : 'active',
          lastActive: authUser?.last_sign_in_at 
            ? formatDistanceToNow(new Date(authUser.last_sign_in_at), { addSuffix: true })
            : 'Never'
        }
      })
    }
  } catch (error) {
    console.error("Error in UsersPage:", error)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button asChild>
          <Link href="/users/invite">
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="w-full bg-white pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userData && userData.length > 0 ? (
              userData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === 'super_admin' ? 'Super Admin' : 
                       user.role === 'admin' ? 'Admin' : 
                       user.role === 'registered_user' ? 'Merchant' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 
                              user.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastActive || 'Never'}</TableCell>
                  <TableCell className="text-right">
                    <SimpleUserActions
                      userId={user.id}
                      currentStatus={user.status as 'active' | 'inactive'}
                      currentRole={user.role}
                      userEmail={user.email}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found. Please check database connection or user permissions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Total Users: {userData.length}
      </div>
    </div>
  )
} 