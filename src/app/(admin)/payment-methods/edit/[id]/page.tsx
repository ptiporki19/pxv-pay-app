"use client"

import { PaymentMethodFormSimple } from "@/components/forms/payment-method-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { paymentMethodsApi, PaymentMethod } from "@/lib/supabase/client-api"
import { useParams } from "next/navigation"

export default function EditPaymentMethodPage() {
  const params = useParams()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        if (params?.id) {
          const method = await paymentMethodsApi.getById(params.id as string)
          setPaymentMethod(method)
        }
      } catch (error) {
        console.error("Error fetching payment method:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethod()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
          <PaymentMethodFormSimple initialData={paymentMethod || undefined} />
        </div>
      </div>
    </div>
  )
} 