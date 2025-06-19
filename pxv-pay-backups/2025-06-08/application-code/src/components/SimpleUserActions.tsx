'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toggleUserStatus, updateUserRole } from '@/app/(admin)/users/actions'

interface SimpleUserActionsProps {
  userId: string
  currentStatus: 'active' | 'inactive'
  currentRole: string
  userEmail: string
}

export function SimpleUserActions({ userId, currentStatus = 'active', currentRole = 'registered_user', userEmail }: SimpleUserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    const newStatus = currentStatus === 'active' ? false : true
    
    try {
      const result = await toggleUserStatus(userId, newStatus)
      
      if (result.success) {
        console.log(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
        // Force page reload to show changes
        window.location.reload()
      } else {
        console.error(result.error || 'Failed to update user status')
        alert(result.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('An unexpected error occurred')
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true)
    
    try {
      const result = await updateUserRole(userId, newRole)
      
      if (result.success) {
        console.log(`User role updated to ${newRole}`)
        // Force page reload to show changes
        window.location.reload()
      } else {
        console.error(result.error || 'Failed to update user role')
        alert(result.error || 'Failed to update user role')
      }
    } catch (error) {
      console.error('An unexpected error occurred')
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Current role badge */}
      <Badge variant="outline">
        {currentRole === 'super_admin' ? 'Super Admin' : 
         currentRole === 'admin' ? 'Admin' : 
         currentRole === 'subscriber' ? 'Subscriber' : 'User'}
      </Badge>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleRoleChange('registered_user')}>
            Make User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange('subscriber')}>
            Make Subscriber
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange('super_admin')}>
            Make Super Admin
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