"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Copy, ExternalLink, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckoutLink } from "@/types/checkout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function CheckoutLinksList() {
  const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch checkout links from the API
  useEffect(() => {
    const fetchCheckoutLinks = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          toast({ 
            title: "Error", 
            description: "You must be logged in to view checkout links", 
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
          .eq('merchant_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Filter by search query if provided
        const filteredData = searchQuery.trim() 
          ? data.filter(link => 
              link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              link.slug.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : data

        setCheckoutLinks(filteredData || [])
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
  }, [searchQuery])

  // Handle delete checkout link
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this checkout link?")) return
    
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('checkout_links')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({ title: "Success", description: "Checkout link deleted successfully" })
      
      // Refresh the list
      setCheckoutLinks(prev => prev.filter(link => link.id !== id))
    } catch (err) {
      console.error("Error deleting checkout link:", err)
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to delete checkout link", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle copy link
  const handleCopyLink = async (slug: string) => {
    const link = `${window.location.origin}/c/${slug}`
    try {
      await navigator.clipboard.writeText(link)
      toast({ title: "Success", description: "Checkout link copied to clipboard" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to copy link to clipboard", 
        variant: "destructive" 
      })
    }
  }

  // Status badge style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  // Format amount display based on type
  const formatAmountDisplay = (link: CheckoutLink) => {
    if (link.amount_type === 'flexible') {
      const minAmount = formatCurrency(link.min_amount || 0, link.currency)
      const maxAmount = formatCurrency(link.max_amount || 0, link.currency)
      return `${minAmount} - ${maxAmount}`
    }
    return formatCurrency(link.amount, link.currency)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout Links</h1>
          <p className="text-muted-foreground">Create and manage payment checkout links for your customers.</p>
        </div>
        <Link href="/checkout-links/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </Link>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search checkout links..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
          <div className="w-1/4">Title</div>
          <div className="w-1/6">Amount</div>
          <div className="w-1/6">Payments</div>
          <div className="w-1/6">Status</div>
          <div className="w-1/6">Created</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-3 text-center text-muted-foreground">
            Loading checkout links...
          </div>
        ) : checkoutLinks.length > 0 ? (
          checkoutLinks.map((link) => (
            <div key={link.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="w-1/4">
                <div className="font-medium">{link.title}</div>
                <div className="text-sm text-muted-foreground">/{link.slug}</div>
              </div>
              <div className="w-1/6">
                {formatAmountDisplay(link)}
              </div>
              <div className="w-1/6">
                <span className="text-sm">
                  {link.payments?.[0]?.count || 0} payments
                </span>
              </div>
              <div className="w-1/6">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(link.status)}`}>
                  {link.status === 'active' ? 'Active' : 
                   link.status === 'inactive' ? 'Inactive' : 
                   link.status === 'expired' ? 'Expired' : 'Draft'}
                </span>
              </div>
              <div className="w-1/6">
                <span className="text-sm text-muted-foreground">
                  {new Date(link.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="w-1/12 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCopyLink(link.slug)}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/c/${link.slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>View Page</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/checkout-links/${link.id}/analytics`}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/checkout-links/edit/${link.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => link.id && handleDelete(link.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-muted-foreground">
            No checkout links found. Create one to get started.
          </div>
        )}
      </div>
    </>
  )
} 