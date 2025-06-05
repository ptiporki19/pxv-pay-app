"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { checkoutLinksApi, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { CheckoutLink } from "@/types/checkout"
import { X, Plus, CreditCard } from "lucide-react"
import Link from "next/link"

interface CheckoutLinkFormSimplifiedProps {
  initialData?: CheckoutLink
  onSuccess?: () => void
}

interface Country {
  id: string
  name: string
  code: string
  currency_code: string
  payment_methods_count?: number
}

export function CheckoutLinkFormSimplified({ initialData, onSuccess }: CheckoutLinkFormSimplifiedProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    amount: initialData?.amount?.toString() || '',
    amount_type: (initialData?.amount_type || 'fixed') as 'fixed' | 'flexible',
    min_amount: initialData?.min_amount?.toString() || '',
    max_amount: initialData?.max_amount?.toString() || '',
    status: (initialData?.status || 'active') as 'active' | 'inactive',
    active_country_codes: initialData?.active_country_codes || [],
    slug: initialData?.slug || ''
  })

  useEffect(() => {
    loadCountriesWithPaymentMethods()
  }, [])

  // Load countries that have payment methods (only user-created payment methods)
  const loadCountriesWithPaymentMethods = async () => {
    try {
      setLoadingCountries(true)
      
      // Get all user's payment methods first
      const paymentMethods = await paymentMethodsApi.getAll()
      
      if (paymentMethods.length === 0) {
        console.log('No payment methods found for user')
        setCountries([])
        return
      }
      
      // Get all unique country codes from payment methods
      const countryCodesWithPaymentMethods = new Set<string>()
      paymentMethods.forEach(pm => {
        if (pm.countries && Array.isArray(pm.countries)) {
          pm.countries.forEach(countryCode => countryCodesWithPaymentMethods.add(countryCode))
        }
      })
      
      if (countryCodesWithPaymentMethods.size === 0) {
        console.log('No countries found in payment methods')
        setCountries([])
        return
      }
      
      // Get all countries and filter to only those with payment methods
      const allCountries = await countriesApi.getAll()
      const countriesWithPaymentMethods: Country[] = []
      
      allCountries.forEach(country => {
        // Include countries that have payment methods OR are already selected in the checkout link
        if (countryCodesWithPaymentMethods.has(country.code) || 
            (initialData?.active_country_codes || []).includes(country.code)) {
          countriesWithPaymentMethods.push({
            id: country.id || '',
            name: country.name,
            code: country.code,
            currency_code: country.currency_code || '',
            payment_methods_count: paymentMethods.filter(pm => 
              pm.countries && pm.countries.includes(country.code)
            ).length
          })
        }
      })

      console.log('Countries with payment methods:', countriesWithPaymentMethods.length)
      setCountries(countriesWithPaymentMethods)
      
    } catch (error) {
      console.error('Error loading countries:', error)
      toast({
        title: "Error",
        description: "Failed to load available countries",
        variant: "destructive"
      })
    } finally {
      setLoadingCountries(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)

      // Basic validation
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive"
        })
        return
      }

      if (formData.amount_type === 'fixed' && (!formData.amount || parseFloat(formData.amount) <= 0)) {
        toast({
          title: "Error", 
          description: "Amount is required and must be greater than 0 for fixed pricing",
          variant: "destructive"
        })
        return
      }

      if (formData.amount_type === 'flexible') {
        const minAmount = parseFloat(formData.min_amount)
        const maxAmount = parseFloat(formData.max_amount)
        
        if (!formData.min_amount || !formData.max_amount || minAmount <= 0 || maxAmount <= 0) {
          toast({
            title: "Error",
            description: "Min and max amounts are required and must be greater than 0 for flexible pricing",
            variant: "destructive"
          })
          return
        }
        
        if (minAmount >= maxAmount) {
          toast({
            title: "Error",
            description: "Maximum amount must be greater than minimum amount",
            variant: "destructive"
          })
          return
        }
      }

      if (formData.active_country_codes.length === 0) {
        toast({
          title: "Error",
          description: "At least one country must be selected",
          variant: "destructive"
        })
        return
      }

      // Get currency from selected countries
      const selectedCountries = countries.filter(c => formData.active_country_codes.includes(c.code))
      if (selectedCountries.length === 0) {
        toast({
          title: "Error",
          description: "Selected countries must have valid currency information",
          variant: "destructive"
        })
        return
      }

      // Use the currency from the first selected country
      const currency = selectedCountries[0].currency_code
      if (!currency) {
        toast({
          title: "Error",
          description: "Selected country must have a currency configured",
          variant: "destructive"
        })
        return
      }

      // Prepare submission data
      const submissionData: any = {
        title: formData.title.trim(),
        amount_type: formData.amount_type,
        status: formData.status,
        active_country_codes: formData.active_country_codes,
        is_active: formData.status === 'active',
        currency: currency
      }

      // Add amount fields based on type
      if (formData.amount_type === 'fixed') {
        submissionData.amount = parseFloat(formData.amount)
        submissionData.min_amount = null
        submissionData.max_amount = null
      } else {
        submissionData.amount = null
        submissionData.min_amount = parseFloat(formData.min_amount)
        submissionData.max_amount = parseFloat(formData.max_amount)
      }

      if (initialData?.id) {
        await checkoutLinksApi.update(initialData.id, submissionData)
        toast({
          title: "Success",
          description: "Checkout link updated successfully",
        })
      } else {
        await checkoutLinksApi.create(submissionData)
        toast({
          title: "Success", 
          description: "Checkout link created successfully",
        })
      }
      
      onSuccess?.()
      router.push('/checkout-links')
      
    } catch (error) {
      console.error("Error saving checkout link:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save checkout link",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCountry = (countryCode: string) => {
    if (!formData.active_country_codes.includes(countryCode)) {
      setFormData(prev => ({
        ...prev,
        active_country_codes: [...prev.active_country_codes, countryCode]
      }))
    }
  }

  const removeCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      active_country_codes: prev.active_country_codes.filter(code => code !== countryCode)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              
              {initialData && (
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    disabled
                    className="bg-background"
                  />
                  <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Countries Section */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select countries where this checkout link will be available
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Available Countries *</Label>
              
              {countries.length === 0 && !loadingCountries ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <CreditCard className="h-12 w-12 opacity-50" />
                    <div>
                      <p className="font-medium">No Countries Available</p>
                      <p className="text-sm">You need to create payment methods for countries first</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/payment-methods/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Payment Method
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Select 
                    onValueChange={(value) => addCountry(value)}
                    disabled={loadingCountries}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select countries"} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries
                        .filter(country => !formData.active_country_codes.includes(country.code))
                        .map((country) => (
                          <SelectItem key={country.id} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.name} ({country.code})</span>
                              <Badge variant="outline" className="text-xs">
                                {country.currency_code}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Display selected countries */}
                  {formData.active_country_codes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.active_country_codes.map((countryCode) => {
                        const country = countries.find(c => c.code === countryCode)
                        return (
                          <Badge key={countryCode} variant="secondary" className="gap-1">
                            {country?.name || countryCode} ({countryCode}) - {country?.currency_code}
                            <button
                              type="button"
                              onClick={() => removeCountry(countryCode)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Click × to remove a country.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/checkout-links')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Checkout Link" : "Create Checkout Link"}
          </Button>
        </div>
      </form>
    </div>
  )
} 