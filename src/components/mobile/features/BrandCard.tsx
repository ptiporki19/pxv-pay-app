"use client"

import { useState } from "react"
import { 
  EllipsisVerticalIcon, 
  BuildingStorefrontIcon, 
  PencilIcon, 
  TrashIcon
} from "@heroicons/react/24/solid"
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
import type { Brand } from "@/lib/supabase/client-api"

interface BrandCardProps {
  brand: Brand
  onDelete: (id: string) => void
  onStatusChange?: (id: string, isActive: boolean) => void
}

export function BrandCard({ brand, onDelete, onStatusChange }: BrandCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    if (brand.id) {
      router.push(`/m/brands/edit/${brand.id}`)
    }
  }

  const handleDelete = async () => {
    if (!brand.id) return
    
    setIsDeleting(true)
    try {
      await onDelete(brand.id)
      toast({
        title: "Brand deleted",
        description: "Brand has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Delete failed", 
        description: "Unable to delete brand",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = (newStatus: boolean) => {
    if (brand.id && onStatusChange) {
      onStatusChange(brand.id, newStatus)
      const statusText = newStatus ? 'activated' : 'deactivated'
      toast({
        title: "Status updated",
        description: `Brand ${statusText} successfully`,
      })
    }
  }

  const getStatusColor = (status: boolean) => {
    return status 
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
      : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon or Logo */}
          <div className="size-8 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
            {brand.logo_url ? (
              <img 
                src={brand.logo_url} 
                alt={brand.name}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <BuildingStorefrontIcon className="size-4 text-violet-600 dark:text-violet-400" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm text-card-foreground truncate font-roboto">
                {brand.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(brand.is_active)}`}>
                {brand.is_active ? 'active' : 'inactive'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-roboto">
                {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : 'No date'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <EllipsisVerticalIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={handleEdit} className="text-xs font-roboto">
              <PencilIcon className="mr-2 size-3" />
              Edit
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Status Change Options */}
            {!brand.is_active && (
              <DropdownMenuItem 
                onClick={() => handleStatusChange(true)}
                className="text-xs font-roboto"
              >
                Activate
              </DropdownMenuItem>
            )}
            {brand.is_active && (
              <DropdownMenuItem 
                onClick={() => handleStatusChange(false)}
                className="text-xs font-roboto"
              >
                Deactivate
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs font-roboto text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <TrashIcon className="mr-2 size-3" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 