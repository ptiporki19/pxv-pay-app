"use client"

import { useState } from "react"
import { 
  EllipsisVerticalIcon, 
  CreditCardIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/solid"
import { PaymentMethod } from "@/lib/supabase/client-api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: PaymentMethod['status']) => void
}

export function PaymentMethodCard({ paymentMethod, onDelete, onStatusChange }: PaymentMethodCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleViewLink = () => {
    if (paymentMethod.url) {
      window.open(paymentMethod.url, '_blank')
    }
  }

  const handleEdit = () => {
    router.push(`/m/payment-methods/edit/${paymentMethod.id}`)
  }

  const handleDelete = async () => {
    if (!paymentMethod.id) return
    
    setIsDeleting(true)
    try {
      await onDelete(paymentMethod.id)
      toast({
        title: "Payment method deleted",
        description: "Payment method has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Delete failed", 
        description: "Unable to delete payment method",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = (newStatus: PaymentMethod['status']) => {
    if (!paymentMethod.id) return
    onStatusChange?.(paymentMethod.id, newStatus)
    const statusText = newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'set to draft'
    toast({
      title: "Status updated",
      description: `Payment method ${statusText} successfully`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
      case 'inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Image */}
          <div className="size-8 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {paymentMethod.image_url ? (
              <img
                src={paymentMethod.image_url}
                alt={paymentMethod.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const icon = document.createElement('div')
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 text-violet-600 dark:text-violet-400"><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5h-3.75a.75.75 0 01-.75-.75zM3 11.055c0-.47.38-.855.848-.855h15.304c.468 0 .848.385.848.855v.09c0 .47-.38.855-.848.855H3.848c-.468 0-.848-.385-.848-.855v-.09z"/></svg>'
                    parent.appendChild(icon)
                  }
                }}
              />
            ) : (
              <CreditCardIcon className="size-4 text-violet-600 dark:text-violet-400" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-normal text-card-foreground truncate font-roboto">
                {paymentMethod.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-normal ${getStatusColor(paymentMethod.status)}`}>
                {paymentMethod.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-normal font-roboto">{paymentMethod.type}</span>
              <span>•</span>
              <span className="font-normal font-roboto">
                {paymentMethod.countries && paymentMethod.countries.length > 0
                  ? paymentMethod.countries.join(', ')
                  : 'No countries'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown - No copy button for payment methods */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <EllipsisVerticalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {/* Conditionally show View Link only for payment-link type */}
              {paymentMethod.type === 'payment-link' && paymentMethod.url && (
                <>
                  <DropdownMenuItem onClick={handleViewLink} className="text-xs font-normal font-roboto">
                    <ArrowTopRightOnSquareIcon className="mr-2 size-3" />
                    View Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={handleEdit} className="text-xs font-normal font-roboto">
                <PencilIcon className="mr-2 size-3" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Status Change Options */}
              {paymentMethod.status !== 'active' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('active')}
                  className="text-xs font-normal font-roboto"
                >
                  Activate
                </DropdownMenuItem>
              )}
              {paymentMethod.status !== 'inactive' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('inactive')}
                  className="text-xs font-normal font-roboto"
                >
                  Deactivate
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs font-normal font-roboto text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <TrashIcon className="mr-2 size-3" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 