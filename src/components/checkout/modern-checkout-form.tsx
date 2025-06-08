'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  Copy,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ModernCheckoutFormProps {
  slug: string
}

interface Country {
  id: string
  name: string
  code: string
  currency_id?: string
  currency?: {
    id: string
    name: string
    code: string
    symbol: string
  }
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  description?: string
  instructions_for_checkout?: string
  url?: string
  icon_url?: string
  display_order: number
  account_details?: Array<{
    id: string
    label: string
    value: string
    type: string
    required: boolean
    placeholder?: string
  }>
  additional_info?: string
}

interface InstructionItem {
  type: 'pair' | 'text';
  label?: string;
  value?: string;
  text?: string;
}

type CheckoutStep = 'details' | 'payment-methods' | 'payment-details' | 'proof-upload' | 'confirmation'

const parseInstructions = (instructions: string): InstructionItem[] => {
  if (!instructions) return []
  return instructions.split('\n').map(line => {
    const parts = line.split(':');
    if (parts.length > 1) {
      return {
        type: 'pair' as 'pair',
        label: parts[0]?.trim(),
        value: parts.slice(1).join(':').trim(),
      };
    } else {
      return {
        type: 'text' as 'text',
        text: line.trim(),
      };
    }
  }).filter(item => (item.type === 'text' && item.text) || (item.type === 'pair' && item.label && item.value));
};

const formatValueForDisplay = (value: string): string => {
  if (!value) return value;
  
  // Be more aggressive with truncation to ensure good layout
  if (value.length > 16) {
    // For crypto addresses or long alphanumeric strings
    if (/^[a-zA-Z0-9]+$/.test(value) && value.length > 20) {
      return `${value.substring(0, 6)}•••${value.substring(value.length - 6)}`;
    }
    // For other long values, truncate more aggressively
    return `${value.substring(0, 16)}•••`;
  }
  
  return value;
};

const isTruncated = (value: string): boolean => {
  return value.length > 16;
};

export function ModernCheckoutForm({ slug }: ModernCheckoutFormProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details')
  
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  
  // State for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  useEffect(() => {
    async function validateCheckout() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/checkout/${slug}/validate`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to validate checkout')
        if (!data.valid) throw new Error('Checkout link is not valid or inactive')
        
        console.log('Checkout validation response:', data)
        console.log('Checkout link type:', data.checkout_link?.checkout_type)
        console.log('Product name:', data.checkout_link?.product_name)
        console.log('Product description:', data.checkout_link?.product_description?.substring(0, 100))
        console.log('Product image:', data.checkout_link?.product_image_url)
        
        setCheckoutData(data)
        const countriesResponse = await fetch(`/api/checkout/${slug}/countries`)
        const countriesData = await countriesResponse.json()
        if (countriesResponse.ok) setCountries(countriesData.countries || [])
      } catch (err) {
        console.error('Checkout validation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load checkout')
      } finally {
        setLoading(false)
      }
    }
    validateCheckout()
  }, [slug])

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard!', { 
        description: formatValueForDisplay(textToCopy),
        duration: 2000 
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard.', { duration: 2000 });
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !customerEmail.trim() || !selectedCountry) {
      setError('Please fill in all required fields'); return;
    }
    if (checkoutData?.checkout_link?.amount_type === 'flexible' && (!amount || parseFloat(amount) <= 0)) {
      setError('Please enter a valid amount'); return;
    }
    setError(null); setSubmitting(true);
    try {
      const response = await fetch(`/api/checkout/${slug}/methods?country=${selectedCountry}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to load payment methods')
      setPaymentMethods(data.payment_methods || [])
      setCurrentStep('payment-methods')
    } catch (err) {
      console.error('Error loading payment methods:', err)
      setError(err instanceof Error ? err.message : 'Failed to load payment methods')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
  }

  const handleProceedToDetails = () => {
    if (selectedPaymentMethod) {
      console.log('Selected payment method:', selectedPaymentMethod)
      console.log('Payment method type:', selectedPaymentMethod.type)
      console.log('Payment method URL:', selectedPaymentMethod.url)
      
      if (selectedPaymentMethod.type === 'payment_link' && selectedPaymentMethod.url) {
        // Ensure URL has proper protocol
        let url = selectedPaymentMethod.url.trim()
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url
        }
        
        try {
          console.log('Opening payment URL:', url)
          // Open in new tab
          window.open(url, '_blank', 'noopener,noreferrer')
          
          // Instead of going to confirmation, go to proof upload
          setTimeout(() => {
            setCurrentStep('proof-upload')
          }, 1000)
        } catch (error) {
          console.error('Error opening payment URL:', error)
          setError('Failed to open payment link. Please try again.')
        }
      } else {
        setCurrentStep('payment-details')
      }
    }
  }

  const handleProceedToUpload = () => {
    setCurrentStep('proof-upload')
  }

  const handleProofUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) {
      setError('Please select a proof of payment file')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('proof', proofFile)
      formData.append('customer_name', customerName)
      formData.append('customer_email', customerEmail)
      formData.append('amount', checkoutData?.checkout_link?.amount_type === 'fixed' ? checkoutData.checkout_link.amount.toString() : amount)
      formData.append('country', selectedCountry)
      formData.append('payment_method_id', selectedPaymentMethod?.id || '')
      formData.append('checkout_link_id', checkoutData?.checkout_link?.id || '')

      const response = await fetch(`/api/checkout/${slug}/submit`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit payment proof')
      }

      setPaymentId(result.payment_id)
      setCurrentStep('confirmation')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload proof')
    } finally {
      setSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details':
        return 'Enter Your Details'
      case 'payment-methods':
        return 'Select Payment Method'
      case 'payment-details':
        return 'Payment Details'
      case 'proof-upload':
        return 'Upload Proof of Payment'
      case 'confirmation':
        return 'Payment Submitted'
      default:
        return 'Complete Your Payment'
    }
  }
  
  // Helper function to truncate text and manage expansion
  const renderDescription = (description: string) => {
    const maxLength = 600 // Increased from 300 to show more text before truncation
    const shouldTruncate = description.length > maxLength
    
    if (!shouldTruncate) {
      return (
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
          {description}
        </p>
      )
    }
    
    const displayText = isDescriptionExpanded ? description : description.substring(0, maxLength) + '...'
    
    return (
      <div>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-3">
          {displayText}
        </p>
        <button
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          {isDescriptionExpanded ? (
            <>
              See less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              See more <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-700 justify-center mb-4">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const checkoutLink = checkoutData?.checkout_link
  if (!checkoutLink) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-700 justify-center">
                <AlertCircle className="h-5 w-5" />
                <span>Checkout link not found</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectedCountryData = countries.find(c => c.code === selectedCountry)
  const currency = selectedCountryData?.currency

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className={cn(
        "mx-auto space-y-4",
        checkoutLink.checkout_type === 'product' && currentStep === 'details' 
          ? "max-w-6xl" 
          : "max-w-md"
      )}>
        <div className="bg-white rounded-2xl p-6 text-center">
          {checkoutLink.logo_url && (
            <img src={checkoutLink.logo_url} alt="Merchant Logo" className="h-8 mx-auto mb-4 object-contain"/>
          )}
          <h1 className="text-lg font-medium text-gray-900">Complete Your Payment</h1>
        </div>

        {(() => {
          const isProductCheckout = checkoutLink.checkout_type === 'product'
          const isDetailsStep = currentStep === 'details'
          console.log('Rendering decision:', {
            checkout_type: checkoutLink.checkout_type,
            currentStep,
            isProductCheckout,
            isDetailsStep,
            willShowProductLayout: isProductCheckout && isDetailsStep
          })
          return isProductCheckout && isDetailsStep
        })() ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Product Information Card */}
            <div className="bg-white rounded-2xl p-6 flex flex-col h-[700px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {checkoutLink.product_name}
              </h2>
              
              {checkoutLink.product_image_url && (
                <div className="bg-gray-100 rounded-2xl p-4 mb-6">
                  <img 
                    src={checkoutLink.product_image_url} 
                    alt={checkoutLink.product_name || 'Product'} 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              )}
              
              {checkoutLink.product_description && (
                <div className="flex-1 overflow-y-auto mb-6">
                  {renderDescription(checkoutLink.product_description)}
                </div>
              )}
              
              {checkoutLink.amount_type === 'fixed' && (
                <div className="border-t border-gray-200 pt-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-medium">PRICE</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {currency ? (
                        `${checkoutLink.checkout_type === 'product' ? (checkoutLink.custom_price || checkoutLink.amount) : checkoutLink.amount} ${currency.code}`
                      ) : (
                        `${checkoutLink.checkout_type === 'product' ? (checkoutLink.custom_price || checkoutLink.amount) : checkoutLink.amount}`
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Form Card */}
            <div className="bg-white rounded-2xl p-6 flex flex-col h-[700px]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium text-gray-900">Enter Your Details</h2>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg text-red-800 text-sm mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleDetailsSubmit} className="space-y-4 flex-1 flex flex-col">
                <div>
                  <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 mb-2 block">Full Name</Label>
                  <Input 
                    id="customerName" 
                    type="text" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    placeholder="Enter your full name" 
                    className="w-full bg-gray-100 border-0 rounded-xl h-12" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
                  <Input 
                    id="customerEmail" 
                    type="email" 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                    placeholder="Enter your email address" 
                    className="w-full bg-gray-100 border-0 rounded-xl h-12" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-full bg-gray-100 border-0 rounded-xl h-12">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name} ({c.currency?.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {checkoutLink.amount_type === 'flexible' && (
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">Amount</Label>
                    <div className="relative">
                      <Input 
                        id="amount" 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="Enter amount" 
                        className="w-full bg-gray-100 border-0 rounded-xl h-12 pr-20" 
                        required
                      />
                      {currency && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Badge variant="secondary" className="bg-gray-700 text-white rounded-full px-3 py-1 text-xs">
                            {currency.code}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 mt-auto">
                  <Button 
                    type="submit" 
                    className="w-full btn-primary rounded-xl h-12" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6">
            <div className="text-center mb-6">
              {(currentStep === 'payment-methods' || currentStep === 'payment-details' || currentStep === 'proof-upload') && (
                <div className="flex items-center justify-center relative mb-2">
                  <button onClick={() => { if (currentStep === 'payment-methods') setCurrentStep('details'); else if (currentStep === 'payment-details') setCurrentStep('payment-methods'); else if (currentStep === 'proof-upload') setCurrentStep('payment-details');}} className="absolute left-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors" title="Go back">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h2 className="text-2xl font-medium text-gray-900">{getStepTitle()}</h2>
                </div>
              )}
              {(currentStep === 'details' || currentStep === 'confirmation') && (
                <h2 className="text-2xl font-medium text-gray-900">{getStepTitle()}</h2>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-800 text-sm mb-6">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            {currentStep === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 mb-2 block">Name</Label>
                  <Input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter your full name" className="w-full bg-gray-100 border-0 rounded-xl h-12" required/>
                </div>
                <div>
                  <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700 mb-2 block">e-mail</Label>
                  <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Enter your email address" className="w-full bg-gray-100 border-0 rounded-xl h-12" required/>
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-full bg-gray-100 border-0 rounded-xl h-12"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>{countries.map((c) => (<SelectItem key={c.code} value={c.code}>{c.name} ({c.currency?.code})</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                {checkoutLink.amount_type === 'flexible' && (
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">Amount</Label>
                    <div className="relative">
                      <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full bg-gray-100 border-0 rounded-xl h-12 pr-20" required/>
                      {currency && (<div className="absolute right-3 top-1/2 -translate-y-1/2"><Badge variant="secondary" className="bg-gray-700 text-white rounded-full px-3 py-1 text-xs">{currency.code}</Badge></div>)}
                    </div>
                  </div>
                )}
                <div className="pt-4">
                  <Button type="submit" className="w-full btn-primary rounded-xl h-12" disabled={submitting}>
                    {submitting ? (<><Spinner size="sm" className="mr-2" />Loading...</>) : 'CONTINUE'}
                  </Button>
                </div>
              </form>
            )}
            {currentStep === 'payment-methods' && (
              <div className="space-y-4">
                <div className="text-center mb-4"><p className="text-gray-600 text-sm">Amount: {checkoutLink.amount_type === 'fixed' ? (checkoutLink.checkout_type === 'product' ? (checkoutLink.custom_price || checkoutLink.amount) : checkoutLink.amount) : amount} {currency?.code}</p></div>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-600">No payment methods available for {selectedCountryData?.name}</p></div>
                ) : (
                  <div className="space-y-3 min-h-[300px]">
                    {paymentMethods.sort((a,b) => a.display_order - b.display_order).map((method) => (
                      <div key={method.id} className={cn("rounded-2xl p-4 cursor-pointer transition-all duration-200", selectedPaymentMethod?.id === method.id ? "bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200")} onClick={() => handlePaymentMethodSelect(method)}>
                          <div className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedPaymentMethod?.id === method.id ? "border-white bg-white" : "border-gray-400")}>{selectedPaymentMethod?.id === method.id && (<div className="w-2 h-2 rounded-full bg-gray-600"></div>)}</div>
                            {method.icon_url && (<img src={method.icon_url} alt={method.name} className="w-6 h-6 object-contain"/>)}
                            <div>
                              <h4 className={cn("font-medium text-sm", selectedPaymentMethod?.id === method.id ? "text-white" : "text-gray-900")}>{method.name}</h4>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-4">
                  <Button onClick={handleProceedToDetails} disabled={!selectedPaymentMethod} className="w-full btn-primary rounded-xl h-12">
                    {selectedPaymentMethod?.type === 'payment_link' ? (
                      <>Pay with {selectedPaymentMethod.name}<ArrowRight className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Continue<ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}
            {currentStep === 'payment-details' && selectedPaymentMethod && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-800 mb-1">{checkoutLink.amount_type === 'fixed' ? (checkoutLink.checkout_type === 'product' ? (checkoutLink.custom_price || checkoutLink.amount) : checkoutLink.amount) : amount} {currency?.code}</p>
                  <p className="text-sm text-gray-500">{selectedPaymentMethod.name}</p>
                </div>
                
                <div className="bg-gray-100 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 text-center mb-3">Send payment to:</h3>
                  
                  {/* Display instructions if available */}
                  {selectedPaymentMethod.instructions_for_checkout && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Payment Instructions:</h4>
                      <div className="text-sm text-yellow-700 whitespace-pre-line">
                        {selectedPaymentMethod.instructions_for_checkout}
                      </div>
                    </div>
                  )}
                  
                  {selectedPaymentMethod.account_details && selectedPaymentMethod.account_details.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaymentMethod.account_details.map((field, index) => (
                        <div key={field.id || index} className="flex items-stretch space-x-2 min-h-[44px]">
                          <div className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 w-2/5 flex items-center overflow-hidden">
                            <span className="truncate" title={field.label}>{field.label}</span>
                          </div>
                          <div className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 font-medium flex items-center justify-between min-w-0 overflow-hidden">
                            <span 
                              className={`flex-1 truncate ${isTruncated(field.value) ? 'font-mono text-xs' : ''} mr-2`} 
                              title={isTruncated(field.value) ? `Full value: ${field.value}` : field.value}
                            >
                              {formatValueForDisplay(field.value)}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => handleCopy(field.value)} 
                              className="flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                              title={`Copy ${isTruncated(field.value) ? 'full value' : 'value'} to clipboard`}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedPaymentMethod.additional_info && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{selectedPaymentMethod.additional_info}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Payment method information will be displayed here</p>
                    </div>
                  )}
                </div>
                
                {/* Important note about proof of payment - moved below payment details and styled in yellow */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">Important Note</h4>
                      <p className="text-sm text-yellow-800">
                        After completing your payment using the details above, you will need to upload proof of payment (receipt, screenshot, etc.) on the next page for verification.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleProceedToUpload} className="w-full btn-primary rounded-xl h-12">
                    Continue to Upload Proof
                  </Button>
                </div>
              </div>
            )}
            {currentStep === 'proof-upload' && (
              <form onSubmit={handleProofUpload} className="space-y-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-800 mb-1">{checkoutLink.amount_type === 'fixed' ? checkoutLink.amount : amount} {currency?.code}</p>
                  <p className="text-sm text-gray-500">Upload proof of payment</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Payment Proof</h3>
                      <p className="text-sm text-gray-600 mb-4">Please upload a screenshot, photo, or PDF showing your payment confirmation</p>
                      
                      {/* Supported file types information */}
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium mb-1">Supported File Types:</p>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>• Images: JPG, PNG, GIF, BMP, WebP, SVG</p>
                          <p>• Documents: PDF</p>
                          <p>• Maximum file size: 10MB</p>
                        </div>
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            // Check file size (10MB limit)
                            const maxSize = 10 * 1024 * 1024 // 10MB in bytes
                            if (file.size > maxSize) {
                              setError('File size must be less than 10MB')
                              e.target.value = '' // Clear the input
                              return
                            }
                            setError(null)
                            setProofFile(file)
                          } else {
                            setProofFile(null)
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-background file:text-gray-700 hover:file:bg-gray-100"
                        required
                      />
                    </div>
                    {proofFile && (
                      <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Selected: {proofFile.name}</span>
                        </div>
                        <p className="text-xs text-green-500 mt-1">
                          File size: {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full btn-primary rounded-xl h-12" disabled={submitting || !proofFile}>
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Submit Payment Proof'
                    )}
                  </Button>
                </div>
              </form>
            )}
            {currentStep === 'confirmation' && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Submitted Successfully!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you! Your payment has been submitted for review.
                  </p>
                  {paymentId && (
                    <div className="bg-background rounded-lg p-4 text-left">
                      <p className="text-sm text-gray-600 mb-1">Reference ID:</p>
                      <p className="text-sm font-mono text-gray-900">{paymentId}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    We will review your payment and confirm within 24 hours.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 