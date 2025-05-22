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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = {
  title: 'Users - PXV Pay',
  description: 'Manage users in your payment system',
}

export default async function UsersPage() {
  const supabase = createClient()
  
  // Fetch users and their profiles
  const { data: users, error } = await supabase
    .from('auth.users')
    .select(`
      *,
      profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  
  // Prepare user data with necessary information
  const userData = users?.map(user => {
    return {
      id: user.id,
      name: user.profiles?.full_name || user.email?.split('@')[0] || 'Unknown User',
      email: user.email,
      role: user.profiles?.user_type || 'customer',
      status: user.is_banned ? 'banned' : user.confirmed_at ? 'active' : 'pending',
      lastActive: user.last_sign_in_at 
        ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })
        : 'Never'
    }
  }) || []

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
            {userData.length > 0 ? (
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
                      {user.role === 'super_admin' || user.role === 'admin' ? 'Admin' : 
                      user.role === 'merchant' ? 'Merchant' : 'User'}
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
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/users/${user.id}`} className="w-full">View details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">Activate</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 