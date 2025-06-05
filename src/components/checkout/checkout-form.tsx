'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { CheckoutValidationResult } from '@/types/checkout'

interface CheckoutFormProps {
  slug: string
}

interface Country {
  id: string
  name: string
  code: string
  currency_id?: string
}

export function CheckoutForm({ slug }: CheckoutFormProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutData, setCheckoutData] = useState<CheckoutValidationResult | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [currency, setCurrency] = useState<any>(null)

  // Validate checkout link on mount
  useEffect(() => {
    async function validateCheckout() {
      try {
        setLoading(true)
        setError(null)

        // Validate checkout link
        const validateResponse = await fetch(`/api/checkout/${slug}/validate`)
        const validationResult: CheckoutValidationResult = await validateResponse.json()

        if (!validationResult.valid) {
          setError(validationResult.error || 'Invalid checkout link')
          return
        }

        setCheckoutData(validationResult)

        // Get available countries
        const countriesResponse = await fetch(`/api/checkout/${slug}/countries`)
        const countriesData = await countriesResponse.json()

        if (countriesData.error) {
          setError(countriesData.error)
          return
        }

        setCountries(countriesData.countries || [])

      } catch (err) {
        console.error('Checkout validation error:', err)
        setError('Failed to load checkout page')
      } finally {
        setLoading(false)
      }
    }

    validateCheckout()
  }, [slug])

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!customerName.trim() || !customerEmail.trim() || !amount || !selectedCountry) {
      setError('Please fill in all required fields')
      return
    }

    // Fetch payment methods for selected country
    try {
      setLoading(true)
      setError(null)

      const methodsResponse = await fetch(`/api/checkout/${slug}/methods?country=${selectedCountry}`)
      const methodsData = await methodsResponse.json()

      if (methodsData.error) {
        setError(methodsData.error)
        return
      }

      setPaymentMethods(methodsData.payment_methods || [])
      setCurrency(methodsData.currency)
      setCurrentStep(2)

    } catch (err) {
      console.error('Payment methods fetch error:', err)
      setError('Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    // TODO: Phase 2 - Proceed to payment proof upload
    console.log('Payment method selected:', methodId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!checkoutData?.checkout_link) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>Checkout link not found</span>
        </div>
      </div>
    )
  }

  const { checkout_link, merchant_settings } = checkoutData
  const heading = checkout_link.checkout_page_heading || 
                 merchant_settings?.default_checkout_page_heading || 
                 'Complete Your Payment'

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          {checkout_link.logo_url && (
            <img 
              src={checkout_link.logo_url} 
              alt="Merchant Logo" 
              className="h-16 mx-auto mb-4 object-contain"
            />
          )}
          <CardTitle className="text-2xl">{heading}</CardTitle>
        </CardHeader>
        
        <CardContent>
          {currentStep === 1 ? (
            <form onSubmit={handleStepOne} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Proceed to Payment Methods
            </Button>
          </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Select Payment Method</h3>
                <p className="text-sm text-muted-foreground">
                  Amount: {currency?.symbol}{amount} {currency?.code}
                </p>
              </div>
              
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payment methods available for {selectedCountry}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="mt-4"
                  >
                    Go Back
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-background transition-colors"
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          {method.description && (
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          )}
                          {method.instructions_for_checkout && (
                            <p className="text-xs text-blue-600 mt-1">{method.instructions_for_checkout}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium capitalize">{method.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="w-full mt-4"
                  >
                    Back to Details
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 