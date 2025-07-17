"use client"

import { useState } from "react"
import { 
  EllipsisVerticalIcon, 
  CreditCardIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon
} from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import type { Payment } from "@/lib/supabase/client-api"

interface PaymentVerificationCardProps {
  payment: Payment
  onVerifyPayment: (paymentId: string, status: 'completed' | 'failed') => void
}

export function PaymentVerificationCard({ payment, onVerifyPayment }: PaymentVerificationCardProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleViewDetails = () => {
    if (payment.id) {
      router.push(`/m/verification/${payment.id}`)
    }
  }

  const handleApprove = async () => {
    if (!payment.id) return
    setIsProcessing(true)
    try {
      await onVerifyPayment(payment.id, 'completed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!payment.id) return
    setIsProcessing(true)
    try {
      await onVerifyPayment(payment.id, 'failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'approved'
      case 'failed':
        return 'rejected'
      case 'pending_verification':
        return 'pending'
      default:
        return status
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Payment Method Icon */}
          <div className="size-8 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center flex-shrink-0">
            <CreditCardIcon className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm text-card-foreground truncate font-roboto font-semibold">
                {formatAmount(payment.amount, payment.currency)}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                {getStatusLabel(payment.status)}
              </span>
            </div>
            
            <div className="mb-1">
              <p className="text-sm font-medium text-card-foreground font-roboto">
                {payment.payment_method}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 flex-shrink-0">
                <UserIcon className="size-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate max-w-[100px] font-roboto">
                  {payment.customer_name || 'Unknown'}
                </span>
              </div>
              <span className="text-muted-foreground flex-shrink-0">•</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <ClockIcon className="size-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-roboto">
                  {payment.created_at ? formatDate(payment.created_at) : 'Today'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          {/* View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="h-8 w-8 p-0 hover:bg-violet-100 dark:hover:bg-violet-950/30"
          >
            <EyeIcon className="size-4 text-violet-600 dark:text-violet-400" />
            <span className="sr-only">View details</span>
          </Button>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isProcessing}>
                <EllipsisVerticalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleViewDetails} className="text-xs font-roboto">
                <EyeIcon className="mr-2 size-3" />
                View Details
              </DropdownMenuItem>
              
              {payment.status === 'pending_verification' && (
                <>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="text-xs font-roboto text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400"
                  >
                    <CheckIcon className="mr-2 size-3" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="text-xs font-roboto text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <XMarkIcon className="mr-2 size-3" />
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 