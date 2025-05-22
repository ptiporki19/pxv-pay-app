'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { toggleUserStatus, updateUserRole } from '@/app/(admin)/users/actions'

interface UserActionsProps {
  userId: string
  currentStatus: 'active' | 'inactive'
  currentRole: string
  userEmail: string
}

export function UserActions({ userId, currentStatus, currentRole, userEmail }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    const newStatus = currentStatus === 'active' ? false : true
    
    try {
      const result = await toggleUserStatus(userId, newStatus)
      
      if (result.success) {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
      } else {
        toast.error(result.error || 'Failed to update user status')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true)
    
    try {
      const result = await updateUserRole(userId, newRole)
      
      if (result.success) {
        toast.success(`User role updated to ${newRole}`)
      } else {
        toast.error(result.error || 'Failed to update user role')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Role selector */}
      <Select 
        value={currentRole} 
        onValueChange={handleRoleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="registered_user">User</SelectItem>
          <SelectItem value="subscriber">Subscriber</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
        </SelectContent>
      </Select>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
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
            View details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleToggleStatus}
            className={currentStatus === 'active' ? 'text-red-600' : 'text-green-600'}
          >
            {currentStatus === 'active' ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 