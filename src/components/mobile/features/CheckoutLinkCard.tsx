"use client"

import { useState } from "react"
import { 
  EllipsisVerticalIcon, 
  LinkIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/solid"
import { CheckoutLink } from "@/types/checkout"
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

interface CheckoutLinkCardProps {
  link: CheckoutLink
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: CheckoutLink['status']) => void
}

export function CheckoutLinkCard({ link, onDelete, onStatusChange }: CheckoutLinkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleCopyLink = async () => {
    const checkoutUrl = `${window.location.origin}/c/${link.slug}`
    try {
      await navigator.clipboard.writeText(checkoutUrl)
      toast({
        title: "Link copied",
        description: "Checkout link has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleViewCheckout = () => {
    const checkoutUrl = `/c/${link.slug}`
    window.open(checkoutUrl, '_blank')
  }

  const handleEdit = () => {
    router.push(`/m/checkout-links/edit/${link.id}`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(link.id)
      toast({
        title: "Link deleted",
        description: "Checkout link has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Delete failed", 
        description: "Unable to delete checkout link",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = (newStatus: CheckoutLink['status']) => {
    onStatusChange?.(link.id, newStatus)
    const statusText = newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'set to draft'
    toast({
      title: "Status updated",
      description: `Checkout link ${statusText} successfully`,
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
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="size-8 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
            <LinkIcon className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm text-card-foreground truncate font-roboto font-normal">
                {link.title}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-normal ${getStatusColor(link.status)}`}>
                {link.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-roboto font-normal">{link.slug}</span>
              <span>•</span>
              <span className="font-roboto font-normal">
                {link.active_country_codes && link.active_country_codes.length > 0
                  ? link.active_country_codes.join(', ')
                  : 'No countries'}
              </span>
            </div>
          </div>
        </div>

        {/* Copy Button - Direct on card */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 w-8 p-0 hover:bg-violet-100 dark:hover:bg-violet-950/30"
          >
            <DocumentDuplicateIcon className="size-4 text-violet-600 dark:text-violet-400" />
            <span className="sr-only">Copy checkout link</span>
          </Button>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <EllipsisVerticalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleViewCheckout} className="text-xs font-roboto font-normal">
                <ArrowTopRightOnSquareIcon className="mr-2 size-3" />
                View checkout link
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleEdit} className="text-xs font-roboto font-normal">
                <PencilIcon className="mr-2 size-3" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Status Change Options */}
              {link.status !== 'active' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('active')}
                  className="text-xs font-roboto font-normal"
                >
                  Activate
                </DropdownMenuItem>
              )}
              {link.status !== 'inactive' && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange('inactive')}
                  className="text-xs font-roboto font-normal"
                >
                  Deactivate
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs font-roboto font-normal text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
 