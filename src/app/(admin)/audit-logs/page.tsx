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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: 'Audit Logs - PXV Pay',
  description: 'View system audit logs',
}

export default function AuditLogsPage() {
  // In a real application, this data would come from Supabase
  const auditLogs = [
    { id: '1', userId: 'michael.c@example.com', action: 'user.update', details: 'Changed role for user sarah.j@example.com', timestamp: '2023-06-15T10:30:45Z', ipAddress: '192.168.1.1' },
    { id: '2', userId: 'michael.c@example.com', action: 'user.create', details: 'Created new user james.w@example.com', timestamp: '2023-06-14T14:15:30Z', ipAddress: '192.168.1.1' },
    { id: '3', userId: 'sarah.j@example.com', action: 'payment_method.create', details: 'Added new payment method "Bank Transfer"', timestamp: '2023-06-13T09:45:22Z', ipAddress: '192.168.1.2' },
    { id: '4', userId: 'system', action: 'system.update', details: 'System updated to version 1.2.0', timestamp: '2023-06-12T23:00:00Z', ipAddress: '127.0.0.1' },
    { id: '5', userId: 'michael.c@example.com', action: 'user.deactivate', details: 'Deactivated user olivia.t@example.com', timestamp: '2023-06-11T16:20:10Z', ipAddress: '192.168.1.1' },
  ]

  const actionTypes = {
    'user.update': { label: 'User Update', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
    'user.create': { label: 'User Create', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    'user.deactivate': { label: 'User Deactivate', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
    'payment_method.create': { label: 'Payment Method Create', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
    'system.update': { label: 'System Update', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' },
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track and monitor system activities.</p>
        </div>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Input
          placeholder="Search logs..."
          className="w-full sm:max-w-xs"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user">User Actions</SelectItem>
            <SelectItem value="payment">Payment Actions</SelectItem>
            <SelectItem value="system">System Actions</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Filter by date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs</CardTitle>
          <CardDescription>
            Comprehensive log of all system activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="max-w-[300px]">Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        actionTypes[log.action as keyof typeof actionTypes]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      )}
                    >
                      {actionTypes[log.action as keyof typeof actionTypes]?.label || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {log.details}
                  </TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 