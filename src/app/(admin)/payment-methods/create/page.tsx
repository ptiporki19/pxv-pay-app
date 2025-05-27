"use client"

import { PaymentMethodFormSimplified } from "@/components/forms/payment-method-form-simplified"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreatePaymentMethodPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/payment-methods">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Payment Methods
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Payment Method</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <PaymentMethodFormSimplified />
        </div>
      </div>
    </div>
  )
} 