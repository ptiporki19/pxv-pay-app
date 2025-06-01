"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { CheckoutLink } from "@/types/checkout"
import Link from "next/link"

interface EditCheckoutLinkPageProps {
  params: { id: string }
}

export default function EditCheckoutLinkPage({ params }: EditCheckoutLinkPageProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [checkoutLink, setCheckoutLink] = useState<CheckoutLink | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    amount_type: 'fixed' as 'fixed' | 'flexible',
    min_amount: '',
    max_amount: '',
    status: 'active' as 'active' | 'inactive',
    active_country_codes: [] as string[],
    slug: ''
  })

  // Available countries (simplified list)
  const availableCountries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
  ]

  useEffect(() => {
    loadCheckoutLink()
  }, [params.id])

  const loadCheckoutLink = async () => {
    try {
      setIsLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to edit checkout links",
          variant: "destructive"
        })
        router.push('/signin')
        return
      }

      const { data, error } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('id', params.id)
        .eq('merchant_id', user.id) // Ensure user can only edit their own links
        .single()

      if (error) {
        console.error('Error loading checkout link:', error)
        toast({
          title: "Error",
          description: "Checkout link not found or you don't have permission to edit it",
          variant: "destructive"
        })
        router.push('/checkout-links')
        return
      }

      setCheckoutLink(data)
      setFormData({
        title: data.title || '',
        description: data.description || '',
        amount: data.amount?.toString() || '',
        currency: data.currency || 'USD',
        amount_type: data.amount_type || 'fixed',
        min_amount: data.min_amount?.toString() || '',
        max_amount: data.max_amount?.toString() || '',
        status: data.status || 'active',
        active_country_codes: data.active_country_codes || [],
        slug: data.slug || ''
      })

    } catch (error) {
      console.error('Error loading checkout link:', error)
      toast({
        title: "Error",
        description: "Failed to load checkout link",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Basic validation
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive"
        })
        return
      }

      if (formData.amount_type === 'fixed' && !formData.amount) {
        toast({
          title: "Error", 
          description: "Amount is required for fixed pricing",
          variant: "destructive"
        })
        return
      }

      if (formData.amount_type === 'flexible' && (!formData.min_amount || !formData.max_amount)) {
        toast({
          title: "Error",
          description: "Min and max amounts are required for flexible pricing",
          variant: "destructive"
        })
        return
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        currency: formData.currency,
        amount_type: formData.amount_type,
        status: formData.status,
        active_country_codes: formData.active_country_codes,
        updated_at: new Date().toISOString()
      }

      // Add amount fields based on type
      if (formData.amount_type === 'fixed') {
        Object.assign(updateData, {
          amount: parseFloat(formData.amount),
          min_amount: null,
          max_amount: null
        })
      } else {
        Object.assign(updateData, {
          amount: null,
          min_amount: parseFloat(formData.min_amount),
          max_amount: parseFloat(formData.max_amount)
        })
      }

      const { error } = await supabase
        .from('checkout_links')
        .update(updateData)
        .eq('id', params.id)

      if (error) {
        console.error('Error updating checkout link:', error)
        toast({
          title: "Error",
          description: "Failed to update checkout link",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Checkout link updated successfully"
      })

      router.push('/checkout-links')

    } catch (error) {
      console.error('Error saving checkout link:', error)
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      active_country_codes: prev.active_country_codes.includes(countryCode)
        ? prev.active_country_codes.filter(code => code !== countryCode)
        : [...prev.active_country_codes, countryCode]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout link...</p>
        </div>
      </div>
    )
  }

  if (!checkoutLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Checkout Link Not Found</h2>
          <p className="text-gray-600 mb-6">The checkout link you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Link href="/checkout-links">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checkout Links
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
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

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter checkout link title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation</p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter checkout link description"
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount_type">Pricing Type</Label>
                  <Select value={formData.amount_type} onValueChange={(value: 'fixed' | 'flexible') => 
                    setFormData(prev => ({ ...prev, amount_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="flexible">Flexible Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.amount_type === 'fixed' ? (
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_amount">Minimum Amount *</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      value={formData.min_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_amount: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_amount">Maximum Amount *</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      value={formData.max_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_amount: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => 
                  setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Active Countries</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableCountries.map((country) => (
                    <Badge
                      key={country.code}
                      variant={formData.active_country_codes.includes(country.code) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCountry(country.code)}
                    >
                      {country.code} - {country.name}
                      {formData.active_country_codes.includes(country.code) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Click to toggle countries</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Link href="/checkout-links">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 