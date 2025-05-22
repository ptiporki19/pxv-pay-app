"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAdminStore } from "@/lib/store/admin-store"
import { CountryForm } from "@/components/forms/country-form"
import { CurrencyForm } from "@/components/forms/currency-form"
import { PaymentMethodForm } from "@/components/forms/payment-method-form"

export function FormModal() {
  const { isModalOpen, modalType, modalAction, currentItem, closeModal } = useAdminStore()
  
  // Determine the title based on the modal type and action
  const getTitleText = () => {
    const action = modalAction === 'create' ? 'Create' : 'Edit'
    switch (modalType) {
      case 'country':
        return `${action} Country`
      case 'currency':
        return `${action} Currency`
      case 'payment-method':
        return `${action} Payment Method`
      default:
        return 'Form'
    }
  }
  
  // Render the appropriate form based on the modal type
  const renderForm = () => {
    switch (modalType) {
      case 'country':
        return <CountryForm initialData={currentItem} />
      case 'currency':
        return <CurrencyForm initialData={currentItem} />
      case 'payment-method':
        return <PaymentMethodForm initialData={currentItem} />
      default:
        return null
    }
  }
  
  return (
    <Dialog open={isModalOpen} onOpenChange={(open: boolean) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{getTitleText()}</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  )
} 