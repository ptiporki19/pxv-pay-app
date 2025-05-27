"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PaymentMethodFormSimplified } from "@/components/forms/payment-method-form-simplified"
import { paymentMethodsApi, PaymentMethod } from "@/lib/supabase/client-api"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditPaymentMethodPage() {
  const params = useParams()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        if (params?.id) {
          const method = await paymentMethodsApi.getById(params.id as string)
          setPaymentMethod(method)
        }
      } catch (error) {
        console.error("Error fetching payment method:", error)
        setError("Failed to load payment method")
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethod()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading payment method...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !paymentMethod) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/payment-methods">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Payment Methods
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Payment Method</h1>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Payment Method Not Found</h2>
              <p className="text-muted-foreground">{error || "The requested payment method could not be found."}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Payment Method</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <PaymentMethodFormSimplified initialData={paymentMethod} />
        </div>
      </div>
    </div>
  )
} 