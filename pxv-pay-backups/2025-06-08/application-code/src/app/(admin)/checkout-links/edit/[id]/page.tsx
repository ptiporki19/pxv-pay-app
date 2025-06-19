"use client"

import { useState, useEffect, use } from 'react'
import { CheckoutLinkFormSimplified } from "@/components/forms/checkout-link-form-simplified"
import { checkoutLinksApi } from "@/lib/supabase/client-api"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CheckoutLink } from "@/types/checkout"

interface EditCheckoutLinkPageProps {
  params: Promise<{ id: string }>
}

export default function EditCheckoutLinkPage({ params }: EditCheckoutLinkPageProps) {
  const resolvedParams = use(params)
  const [checkoutLink, setCheckoutLink] = useState<CheckoutLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCheckoutLink = async () => {
      try {
        if (resolvedParams?.id) {
          const link = await checkoutLinksApi.getById(resolvedParams.id as string)
          setCheckoutLink(link)
        }
      } catch (error) {
        console.error("Error fetching checkout link:", error)
        setError("Failed to load checkout link")
      } finally {
        setLoading(false)
      }
    }

    fetchCheckoutLink()
  }, [resolvedParams?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading checkout link...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !checkoutLink) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/checkout-links">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Checkout Links
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Checkout Link</h1>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Checkout Link Not Found</h2>
              <p className="text-muted-foreground">{error || "The requested checkout link could not be found."}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/checkout-links">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Checkout Links
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Checkout Link</h1>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <CheckoutLinkFormSimplified initialData={checkoutLink} />
        </div>
      </div>
    </div>
  )
} 