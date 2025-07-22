"use client"

import { useState, useEffect } from "react"
import { PlusIcon, LinkIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { CheckoutLink } from "@/types/checkout"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { MobileStats } from "@/components/mobile/ui/MobileStats"
import { MobileSearch } from "@/components/mobile/ui/MobileSearch"
import { CheckoutLinkCard } from "@/components/mobile/features/CheckoutLinkCard"
import { Button } from "@/components/ui/button"

export default function MobileCheckoutLinksPage() {
  const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  const filterOptions = [
    { id: "all", label: "All Status" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "draft", label: "Draft" },
  ]

  // Fetch checkout links from the API (reusing existing business logic)
  useEffect(() => {
    const fetchCheckoutLinks = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user || !user.email) {
          toast({ 
            title: "Error", 
            description: "You must be logged in to view checkout links", 
            variant: "destructive" 
          })
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
          return
        }

        const { data, error } = await supabase
          .from('checkout_links')
          .select(`
            *,
            payments:payments(count)
          `)
          .eq('merchant_id', dbUser.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Filter by search query and status if provided
        let filteredData = data || []
        
        if (searchQuery.trim()) {
          filteredData = filteredData.filter(link => 
            (link.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (link.slug?.toLowerCase() || '').includes(searchQuery.toLowerCase())
          )
        }

        if (statusFilter !== "all") {
          filteredData = filteredData.filter(link => link.status === statusFilter)
        }

        // Cast the data to CheckoutLink type to handle null fields
        setCheckoutLinks(filteredData as CheckoutLink[])
      } catch (error) {
        console.error("Error fetching checkout links:", error)
        toast({ 
          title: "Error", 
          description: "Failed to fetch checkout links", 
          variant: "destructive" 
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckoutLinks()
  }, [searchQuery, statusFilter])

  // Delete checkout link
  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('checkout_links')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setCheckoutLinks(prev => prev.filter(link => link.id !== id))
    } catch (error) {
      console.error("Error deleting checkout link:", error)
      throw error
    }
  }

  // Update checkout link status
  const handleStatusChange = async (id: string, status: CheckoutLink['status']) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('checkout_links')
        .update({ 
          status, 
          is_active: status === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setCheckoutLinks(prev => 
        prev.map(link => 
          link.id === id 
            ? { ...link, status, is_active: status === 'active' }
            : link
        )
      )
    } catch (error) {
      console.error("Error updating checkout link status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const totalLinks = checkoutLinks.length
  const activeLinks = checkoutLinks.filter(link => link.status === 'active').length

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-normal text-foreground font-roboto">
            Checkout Links
          </h1>
          <p className="text-sm text-muted-foreground font-roboto">
            Manage checkout links for your customers
          </p>
        </div>
        <Button
          onClick={() => router.push('/m/checkout-links/create')}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white h-8"
        >
          <PlusIcon className="size-3 mr-1" />
          Create
        </Button>
      </div>

      {/* Stats Cards */}
      <MobileStats
        stats={[
          {
            title: "Total Links",
            value: totalLinks.toString(),
            icon: LinkIcon,
            color: "purple"
          },
          {
            title: "Active Links", 
            value: activeLinks.toString(),
            icon: CheckCircleIcon,
            color: "green"
          }
        ]}
      />

      {/* Search and Filter */}
      <MobileSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search checkout links..."
        filterOptions={filterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Checkout Links List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          </div>
        ) : checkoutLinks.length === 0 ? (
          <div className="text-center py-8">
            <LinkIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No checkout links</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new checkout link.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/m/checkout-links/create')}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <PlusIcon className="size-4 mr-2" />
                Create Checkout Link
              </Button>
            </div>
          </div>
        ) : (
          checkoutLinks.map((link) => (
            <CheckoutLinkCard
              key={link.id}
              link={link}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
} 