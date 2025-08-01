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
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: 'Audit Logs - PXV Pay',
  description: 'View system audit logs',
}

interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  old_data: any
  new_data: any
  created_at: string
}

export default async function AuditLogsPage() {
  const supabase = await createClient()
  
  // Fetch audit logs from Supabase with user information
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (
        full_name,
        id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  
  const auditLogs = logs || []

  // If there are no logs yet, add some sample logs
  if (auditLogs.length === 0) {
    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id
    
    if (currentUserId) {
      // Insert sample audit logs
      await supabase.from('audit_logs').insert([
        {
          user_id: currentUserId,
          action: 'INSERT',
          entity_type: 'users',
          entity_id: '11111111-1111-1111-1111-111111111111',
          new_data: { email: 'user@example.com', role: 'customer' }
        },
        {
          user_id: currentUserId,
          action: 'UPDATE',
          entity_type: 'payment_methods',
          entity_id: '22222222-2222-2222-2222-222222222222',
          old_data: { name: 'Bank Transfer', status: 'inactive' },
          new_data: { name: 'Bank Transfer', status: 'active' }
        },
        {
          user_id: currentUserId,
          action: 'UPDATE',
          entity_type: 'payments',
          entity_id: '33333333-3333-3333-3333-333333333333',
          old_data: { status: 'pending' },
          new_data: { status: 'completed' }
        }
      ])
      
      // Fetch the logs again
      const { data: refreshedLogs } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (refreshedLogs) {
        auditLogs.push(...refreshedLogs)
      }
    }
  }

  const actionTypes = {
    'INSERT': { label: 'Create', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    'UPDATE': { label: 'Update', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
    'DELETE': { label: 'Delete', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  }

  const entityTypes = {
    'users': 'User',
    'profiles': 'Profile',
    'merchants': 'Merchant',
    'payments': 'Payment',
    'payment_methods': 'Payment Method',
    'countries': 'Country',
    'currencies': 'Currency',
  }

  // Function to generate a human-readable description of the change
  const getChangeDescription = (log: AuditLog) => {
    const entity = entityTypes[log.entity_type as keyof typeof entityTypes] || log.entity_type
    
    if (log.action === 'INSERT') {
      return `Created new ${entity.toLowerCase()}`
    }
    
    if (log.action === 'DELETE') {
      return `Deleted ${entity.toLowerCase()}`
    }
    
    if (log.action === 'UPDATE') {
      const changedFields: string[] = []
      
      if (log.old_data && log.new_data) {
        // Find what fields changed
        Object.keys(log.new_data).forEach(key => {
          if (JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])) {
            changedFields.push(key)
          }
        })
      }
      
      if (changedFields.length > 0) {
        return `Updated ${entity.toLowerCase()} fields: ${changedFields.join(', ')}`
      }
      
      return `Updated ${entity.toLowerCase()}`
    }
    
    return `${log.action} on ${entity.toLowerCase()}`
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
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="w-full pl-8"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="merchants">Merchants</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
            <SelectItem value="payment_methods">Payment Methods</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="INSERT">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
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
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
              <div className="w-[180px]">Timestamp</div>
              <div className="w-[120px]">User</div>
              <div className="w-[120px]">Action</div>
              <div className="w-[120px]">Entity</div>
              <div className="w-[300px]">Details</div>
            </div>
            
            {/* Table Body */}
              {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <div className="w-[180px]">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-[120px]">
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                      {log.profiles?.full_name || `User ${log.user_id.slice(0, 8)}`}
                    </span>
                  </div>
                  <div className="w-[120px]">
                    <Badge variant="outline" className={cn(
                      'font-roboto',
                      log.action === 'INSERT' && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
                      log.action === 'UPDATE' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
                      log.action === 'DELETE' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                    )}>
                      {log.action}
                      </Badge>
                  </div>
                  <div className="w-[120px]">
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                      {entityTypes[log.entity_type as keyof typeof entityTypes] || log.entity_type}
                    </span>
                  </div>
                  <div className="w-[300px]">
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto truncate block">
                      {getChangeDescription(log)}
                    </span>
                  </div>
                </div>
                ))
              ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-base font-medium text-muted-foreground font-roboto">
                    No audit logs found
                </p>
              </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 