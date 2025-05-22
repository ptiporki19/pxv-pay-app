import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const metadata: Metadata = {
  title: 'User Management - PXV Pay',
  description: 'Manage users and roles',
}

export default function UsersPage() {
  // In a real application, this data would come from Supabase
  const users = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'registered_user', status: 'active', lastActive: '2 hours ago' },
    { id: '2', name: 'Michael Chen', email: 'michael.c@example.com', role: 'super_admin', status: 'active', lastActive: '5 minutes ago' },
    { id: '3', name: 'Olivia Taylor', email: 'olivia.t@example.com', role: 'registered_user', status: 'inactive', lastActive: '3 days ago' },
    { id: '4', name: 'James Wilson', email: 'james.w@example.com', role: 'registered_user', status: 'active', lastActive: '1 day ago' },
    { id: '5', name: 'Emily Brown', email: 'emily.b@example.com', role: 'registered_user', status: 'active', lastActive: '12 hours ago' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and roles.</p>
        </div>
        <Button>Add User</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search users..."
          className="max-w-sm"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="registered_user">Registered User</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            List of all registered users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      {user.name}
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'super_admin' ? 'default' : 'outline'}>
                      {user.role === 'super_admin' ? 'Super Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-100' : ''}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {user.status === 'active' ? (
                        <Button variant="destructive" size="sm">Deactivate</Button>
                      ) : (
                        <Button variant="outline" size="sm">Activate</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 