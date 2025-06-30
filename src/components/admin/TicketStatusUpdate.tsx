'use client'

import { useState } from 'react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateTicketStatus } from '@/lib/actions/tickets'
import { useRouter } from 'next/navigation'

interface TicketStatusUpdateProps {
  ticketId: string
  currentStatus: 'open' | 'in_progress' | 'closed'
}

export function TicketStatusUpdate({ ticketId, currentStatus }: TicketStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    
    setIsUpdating(true)
    try {
      await updateTicketStatus(ticketId, newStatus as 'open' | 'in_progress' | 'closed')
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select 
      defaultValue={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  )
} 
 
 
 
 