"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { MobileEditCheckoutLinkForm } from "@/components/mobile/features/MobileEditCheckoutLinkForm"
import { CheckoutLink } from "@/types/checkout"
import { Spinner } from "@/components/ui/spinner"

interface EditCheckoutLinkPageProps {
  params: {
    id: string
  }
}

export default function EditCheckoutLinkPage({ params }: EditCheckoutLinkPageProps) {
  const [checkoutLink, setCheckoutLink] = useState<CheckoutLink | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCheckoutLink = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()
        
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user || !user.email) {
          toast({
            title: "Error",
            description: "You must be logged in to edit checkout links",
            variant: "destructive"
          })
          router.push('/signin')
          return
        }

        // Get the database user ID using email lookup
        const { data: dbUser, error: userError } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('email', user.email)
          .single()

        if (userError || !dbUser) {
          console.error('Failed to get database user:', userError)
          toast({
            title: "Error",
            description: "Unable to verify user account. Please try logging in again.",
            variant: "destructive"
          })
          router.push('/signin')
          return
        }

        // Fetch the checkout link
        const { data, error } = await supabase
          .from('checkout_links')
          .select('*')
          .eq('id', params.id)
          .eq('merchant_id', dbUser.id)
          .single()

        if (error) {
          console.error('Error fetching checkout link:', error)
          toast({
            title: "Error",
            description: "Checkout link not found or you don't have permission to edit it",
            variant: "destructive"
          })
          router.push('/m/checkout-links')
          return
        }

        setCheckoutLink(data as CheckoutLink)
      } catch (error) {
        console.error('Unexpected error:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading the checkout link",
          variant: "destructive"
        })
        router.push('/m/checkout-links')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCheckoutLink()
    }
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-sm text-muted-foreground">Loading checkout link...</p>
        </div>
      </div>
    )
  }

  if (!checkoutLink) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Checkout link not found
          </h2>
          <p className="text-muted-foreground mb-4">
            The checkout link you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <button
            onClick={() => router.push('/m/checkout-links')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Checkout Links
          </button>
        </div>
      </div>
    )
  }

  return <MobileEditCheckoutLinkForm checkoutLink={checkoutLink} />
} 