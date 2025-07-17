"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MobileEditPaymentMethodForm } from "@/components/mobile/features/MobileEditPaymentMethodForm"
import { paymentMethodsApi, PaymentMethod } from "@/lib/supabase/client-api"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function MobileEditPaymentMethodPage() {
  const params = useParams()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user || !user.email) {
          toast({
            title: "Error",
            description: "You must be logged in to edit payment methods",
            variant: "destructive"
          })
          return
        }

        if (params?.id) {
          const method = await paymentMethodsApi.getById(params.id as string)
          setPaymentMethod(method)
        }
      } catch (error) {
        console.error("Error fetching payment method:", error)
        toast({
          title: "Error",
          description: "Failed to load payment method",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethod()
  }, [params?.id])

  if (loading) {
    return (
      <div className="px-4 py-3 pb-20 pt-12">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  if (!paymentMethod) {
    return (
      <div className="px-4 py-3 pb-20 pt-12">
        <div className="text-center py-8">
          <h3 className="mt-2 text-sm font-medium text-muted-foreground">Payment method not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested payment method could not be found.
          </p>
        </div>
      </div>
    )
  }

  return <MobileEditPaymentMethodForm initialData={paymentMethod} />
} 