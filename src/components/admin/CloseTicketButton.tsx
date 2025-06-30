'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { updateTicketStatus } from '@/lib/actions/tickets'
import { Check } from 'lucide-react'

interface CloseTicketButtonProps {
  ticketId: string
  currentStatus: string
}

export function CloseTicketButton({ ticketId, currentStatus }: CloseTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClose = async () => {
    setIsLoading(true)
    try {
      await updateTicketStatus(ticketId, 'closed')
      toast({
        title: 'Success!',
        description: 'Ticket has been marked as resolved.',
      })
      // Refresh the page to show the updated status
      window.location.reload()
    } catch (error) {
      console.error('Error closing ticket:', error)
      toast({
        title: 'Error',
        description: 'Failed to close the ticket. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus === 'closed') {
    return null
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleClose}
      disabled={isLoading}
      className="text-green-600 border-green-200 hover:bg-green-50"
    >
      <Check className="h-4 w-4 mr-2" />
      {isLoading ? 'Closing...' : 'Mark as Resolved'}
    </Button>
  )
} 
 
 
 
 