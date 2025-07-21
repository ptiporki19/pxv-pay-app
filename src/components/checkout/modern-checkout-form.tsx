'use client'

export const dynamic = 'force-dynamic'

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
  ChevronUp,
  Minus,
  Plus
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
  image_url?: string
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

// Falling animation component
const FallingItems = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle falling dots */}
      <div className="absolute animate-float-slow opacity-20">
        <div className="w-2 h-2 bg-foreground/10 rounded-full" style={{ 
          left: '10%', 
          top: '20%',
          animationDelay: '0s',
          animationDuration: '8s'
        }}></div>
      </div>
      <div className="absolute animate-float-slow opacity-15">
        <div className="w-1.5 h-1.5 bg-foreground/10 rounded-full" style={{ 
          left: '80%', 
          top: '30%',
          animationDelay: '2s',
          animationDuration: '6s'
        }}></div>
      </div>
      <div className="absolute animate-float-slow opacity-10">
        <div className="w-1 h-1 bg-foreground/10 rounded-full" style={{ 
          left: '60%', 
          top: '15%',
          animationDelay: '4s',
          animationDuration: '10s'
        }}></div>
      </div>
      <div className="absolute animate-float-slow opacity-20">
        <div className="w-2 h-2 bg-foreground/5 rounded-full" style={{ 
          left: '30%', 
          top: '40%',
          animationDelay: '1s',
          animationDuration: '7s'
        }}></div>
      </div>
      <div className="absolute animate-float-slow opacity-15">
        <div className="w-1.5 h-1.5 bg-foreground/5 rounded-full" style={{ 
          left: '75%', 
          top: '60%',
          animationDelay: '3s',
          animationDuration: '9s'
        }}></div>
      </div>
    </div>
  )
}

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
    if (!selectedPaymentMethod) return;
      
      if (selectedPaymentMethod.type === 'payment_link' && selectedPaymentMethod.url) {
      // Open payment link in the same tab
      window.location.href = selectedPaymentMethod.url;
      return;
    }
    
    setCurrentStep('payment-details');
  }

  const handleProceedToUpload = () => {
    setCurrentStep('proof-upload')
  }

  const handleProofUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) {
      setError('Please select a file to upload')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append('proof', proofFile)
      formData.append('checkout_link_id', checkoutData.checkout_link.id)
      formData.append('customer_name', customerName)
      formData.append('customer_email', customerEmail)
      formData.append('country', selectedCountry)
      formData.append('payment_method_id', selectedPaymentMethod?.id || '')
      
      // Determine the amount to send
      let finalAmount: string
      if (checkoutData.checkout_link.amount_type === 'fixed') {
        finalAmount = checkoutData.checkout_link.checkout_type === 'product' 
          ? (checkoutData.checkout_link.custom_price || checkoutData.checkout_link.amount).toString()
          : checkoutData.checkout_link.amount.toString()
      } else {
        finalAmount = amount
      }
      formData.append('amount', finalAmount)

      const response = await fetch(`/api/checkout/${slug}/submit`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit payment')
      }

      setPaymentId(result.payment_id)
      setCurrentStep('confirmation')

    } catch (err) {
      console.error('Payment submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit payment')
    } finally {
      setSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details': return 'Enter your details'
      case 'payment-methods': return 'Choose payment method'
      case 'payment-details': return 'Payment information'
      case 'proof-upload': return 'Upload payment proof'
      case 'confirmation': return 'Payment confirmed'
      default: return 'Checkout'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'details': return 'Please provide your contact information and select your country to continue with the payment process.'
      case 'payment-methods': return 'Select your preferred payment method from the available options below.'
      case 'payment-details': return 'Copy the payment details below and complete your payment using your preferred app or bank. Once done, you\'ll need to upload a screenshot as proof.'
      case 'proof-upload': return 'Upload a clear screenshot or photo of your payment confirmation to verify your transaction. Make sure all details are visible.'
      case 'confirmation': return 'Your payment has been successfully submitted and is being processed.'
      default: return ''
    }
  }
  
  const renderDescription = (description: string) => {
    if (!description) return null
    
    const lines = description.split('\n')
    const displayLines = isDescriptionExpanded ? lines : lines.slice(0, 3)
    const hasMore = lines.length > 3
    
    return (
      <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
        {displayLines.map((line, index) => (
          <p key={index} className="font-roboto">{line}</p>
        ))}
        {hasMore && (
        <button
            type="button"
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-medium font-roboto mt-2"
        >
          {isDescriptionExpanded ? (
            <>
                Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
                Show more <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
        )}
      </div>
    )
  }

  const getCurrentAmount = () => {
    if (checkoutData?.checkout_link?.amount_type === 'fixed') {
      return checkoutData.checkout_link.checkout_type === 'product' 
        ? (checkoutData.checkout_link.custom_price || checkoutData.checkout_link.amount)
        : checkoutData.checkout_link.amount
    }
    return amount || '0'
  }

  const selectedCountryData = countries.find(c => c.code === selectedCountry)
  const currency = selectedCountryData?.currency
  const checkoutLink = checkoutData?.checkout_link

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground font-roboto">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error && !checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
          <div className="flex items-center gap-2 text-destructive justify-center mb-4">
                <AlertCircle className="h-5 w-5" />
            <span className="font-roboto">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!checkoutLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
          <div className="flex items-center gap-2 text-destructive justify-center">
                <AlertCircle className="h-5 w-5" />
            <span className="font-roboto">Checkout link not found</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Section - Static Content with Animations */}
          <div className="bg-muted/30 p-8 lg:p-12 flex flex-col border-r border-border relative overflow-hidden">
            <FallingItems />
            
            {/* Brand Header - Aligned with "Enter your details" at the very top */}
            <div className="mb-8 relative z-10">
              {checkoutData?.brand ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={checkoutData.brand.logo_url} 
                    alt={checkoutData.brand.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-lg font-semibold text-foreground font-roboto">
                    {checkoutData.brand.name}
                  </div>
                </div>
              ) : (
                <div className="text-lg text-muted-foreground font-roboto">
                  Complete your payment
                </div>
              )}
            </div>
            
            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center">
            {checkoutLink.checkout_type === 'product' ? (
              // Product Checkout Left Section
              <div className="max-w-md mx-auto w-full relative z-10">
                {/* Amount and Product Info */}
                <div className="mb-8 text-center">
                  <div className="text-3xl font-bold text-foreground font-roboto mb-2">
                    {getCurrentAmount()} {currency?.code}
        </div>
                  <div className="text-sm text-muted-foreground font-roboto">
                {checkoutLink.product_name}
                  </div>
                </div>
              
                {/* Product Image */}
              {checkoutLink.product_image_url && (
                  <div className="mb-6">
                  <img 
                    src={checkoutLink.product_image_url} 
                    alt={checkoutLink.product_name || 'Product'} 
                      className="w-full h-64 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
              
                {/* Product Description */}
              {checkoutLink.product_description && (
                  <div>
                  {renderDescription(checkoutLink.product_description)}
                </div>
              )}
              </div>
            ) : (
              // Simple Checkout Left Section
              <div className="max-w-md mx-auto w-full text-center relative z-10">
                {checkoutLink.amount_type === 'fixed' ? (
                  <div>
                    <div className="text-4xl font-bold text-foreground font-roboto mb-4">
                      {getCurrentAmount()} {currency?.code}
                    </div>
                    <div className="text-lg text-muted-foreground font-roboto mb-2">
                      Payment Required
                    </div>
                    <div className="text-sm text-muted-foreground font-roboto">
                      Complete the form to proceed with your payment
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-foreground font-roboto mb-4">
                      Enter Payment Amount
                    </div>
                    <div className="text-base text-muted-foreground font-roboto">
                      Please specify the amount you'd like to pay and complete your details
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Right Section - Dynamic Forms */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
              {/* Header with back button for non-initial steps */}
              <div className="mb-8">
                {(currentStep !== 'details' && currentStep !== 'confirmation') && (
                  <button 
                    onClick={() => { 
                      if (currentStep === 'payment-methods') setCurrentStep('details'); 
                      else if (currentStep === 'payment-details') setCurrentStep('payment-methods'); 
                      else if (currentStep === 'proof-upload') setCurrentStep('payment-details');
                    }} 
                    className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors mb-6"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground font-roboto mb-3">{getStepTitle()}</h1>
                  <p className="text-sm text-muted-foreground font-roboto max-w-sm mx-auto leading-relaxed">{getStepDescription()}</p>
                </div>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive text-sm mb-6">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-roboto">{error}</span>
                </div>
              )}
              
              {/* Step Content */}
              <div className="flex-1 flex flex-col">
                {currentStep === 'details' && (
                  <form onSubmit={handleDetailsSubmit} className="space-y-6 flex-1 flex flex-col">
                <div>
                      <Label htmlFor="customerName" className="text-sm font-medium text-foreground mb-2 block font-roboto">Full name</Label>
                  <Input 
                    id="customerName" 
                    type="text" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    placeholder="Enter your full name" 
                        className="w-full h-12 font-roboto border-muted-foreground/20 focus:border-muted-foreground dark:border-muted-foreground/40 dark:focus:border-muted-foreground focus:ring-0" 
                    required
                  />
                </div>
                
                <div>
                      <Label htmlFor="customerEmail" className="text-sm font-medium text-foreground mb-2 block font-roboto">Email address</Label>
                  <Input 
                    id="customerEmail" 
                    type="email" 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                    placeholder="Enter your email address" 
                        className="w-full h-12 font-roboto border-muted-foreground/20 focus:border-muted-foreground dark:border-muted-foreground/40 dark:focus:border-muted-foreground focus:ring-0" 
                    required
                  />
                </div>
                
                <div>
                      <Label htmlFor="country" className="text-sm font-medium text-foreground mb-2 block font-roboto">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-full h-12 font-roboto">
                          <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                            <SelectItem key={c.code} value={c.code} className="font-roboto">
                          {c.name} ({c.currency?.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {checkoutLink.amount_type === 'flexible' && (
                  <div>
                        <Label htmlFor="amount" className="text-sm font-medium text-foreground mb-2 block font-roboto">Amount</Label>
                    <div className="relative">
                      <Input 
                        id="amount" 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="Enter amount" 
                            className="w-full h-12 pr-20 font-roboto text-lg border-muted-foreground/20 focus:border-muted-foreground dark:border-muted-foreground/40 dark:focus:border-muted-foreground focus:ring-0" 
                        required
                      />
                      {currency && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <span className="text-muted-foreground font-roboto text-sm">
                            {currency.code}
                              </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                    <div className="mt-auto pt-6">
                  <Button 
                    type="submit" 
                        className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium font-roboto" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Loading...
                      </>
                    ) : (
                          'Continue'
                    )}
                  </Button>
                </div>
              </form>
                )}

                {currentStep === 'payment-methods' && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    {paymentMethods.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground font-roboto">No payment methods available for {selectedCountryData?.name}</p>
          </div>
        ) : (
                      <div className="space-y-3 flex-1">
                        {paymentMethods.sort((a,b) => a.display_order - b.display_order).map((method) => (
                          <div 
                            key={method.id} 
                            className={cn(
                              "rounded-lg p-4 cursor-pointer transition-all duration-200 border",
                              selectedPaymentMethod?.id === method.id 
                                ? "border-foreground bg-background shadow-sm" 
                                : "border-border hover:border-muted-foreground hover:bg-muted/50"
                            )} 
                            onClick={() => handlePaymentMethodSelect(method)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                selectedPaymentMethod?.id === method.id
                                  ? "border-foreground bg-foreground"
                                  : "border-muted-foreground"
                              )}>
                                {selectedPaymentMethod?.id === method.id && (
                                  <div className="w-2 h-2 rounded-full bg-background"></div>
                                )}
                              </div>
                              {method.image_url ? (
                                <img src={method.image_url} alt={method.name} className="w-8 h-8 object-cover rounded"/>
                              ) : method.icon_url ? (
                                <img src={method.icon_url} alt={method.name} className="w-5 h-5 object-contain"/>
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">{method.name.charAt(0)}</span>
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium text-sm text-foreground font-roboto">{method.name}</h4>
                              </div>
                            </div>
                        </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-6">
                      <Button 
                        onClick={handleProceedToDetails} 
                        disabled={!selectedPaymentMethod} 
                        className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium font-roboto"
                      >
                    {selectedPaymentMethod?.type === 'payment_link' ? (
                          <>Pay with {selectedPaymentMethod.name}</>
                    ) : (
                          <>Continue</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'payment-details' && selectedPaymentMethod && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <div className="bg-background rounded-lg p-6 space-y-4 border border-border">
                      <h3 className="text-sm font-medium text-foreground text-center mb-4 font-roboto">Send payment to:</h3>
                  
                  {/* Display instructions if available */}
                  {selectedPaymentMethod.instructions_for_checkout && (
                        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 font-roboto">Payment Instructions:</h4>
                          <div className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-line font-roboto">
                        {selectedPaymentMethod.instructions_for_checkout}
                      </div>
                    </div>
                  )}
                  
                  {selectedPaymentMethod.account_details && selectedPaymentMethod.account_details.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaymentMethod.account_details.map((field, index) => (
                            <div key={field.id || index} className="flex items-center justify-between p-4 bg-muted/50 rounded border">
                              <div className="text-sm font-medium text-foreground font-roboto">
                                {field.label}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium text-foreground font-roboto font-mono">
                                  {formatValueForDisplay(field.value)}
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => handleCopy(field.value)} 
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" 
                                    title="Copy to clipboard"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                        </div>
                      ))}
                      {selectedPaymentMethod.additional_info && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200 font-roboto">{selectedPaymentMethod.additional_info}</p>
                        </div>
                      )}
                </div>
                  ) : (
                        <div className="text-center text-muted-foreground">
                          <p className="font-roboto">Payment method information will be displayed here</p>
                    </div>
                  )}
                </div>
                
                                        {/* Important note about proof of payment */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 font-roboto">Next Step</h4>
                          <p className="text-sm text-amber-800 dark:text-amber-200 font-roboto">
                            After completing your payment, take a screenshot showing the transaction details and upload it on the next page. Ensure the amount, date, and reference are clearly visible for quick verification.
                          </p>
                        </div>
                      </div>
                    </div>
                
                    <div className="mt-auto pt-6">
                      <Button 
                        onClick={handleProceedToUpload} 
                        className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium font-roboto"
                      >
                        Continue to upload proof
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'proof-upload' && (
                  <form onSubmit={handleProofUpload} className="space-y-6 flex-1 flex flex-col">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-foreground mb-2 font-roboto text-center">Choose your file</h3>
                          <p className="text-sm text-muted-foreground mb-4 font-roboto text-center">Upload clear proof of your payment transaction</p>
                          
                          {/* Enhanced file guidance */}
                          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-roboto font-medium mb-2">What to include in your proof:</p>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 font-roboto text-left space-y-1">
                              <li>• Transaction amount and date</li>
                              <li>• Payment reference number</li>
                              <li>• Recipient details (if visible)</li>
                              <li>• Payment confirmation status</li>
                            </ul>
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                              <p className="text-xs text-blue-800 dark:text-blue-200 font-roboto">
                                <span className="font-medium">Supported formats:</span> JPG, PNG, PDF • <span className="font-medium">Max size:</span> 10MB
                              </p>
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
                          }
                        }}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 file:cursor-pointer cursor-pointer font-roboto"
                        required
                      />
                          
                    {proofFile && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm text-green-800 dark:text-green-200 font-roboto">{proofFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                    </div>
                    
                    <div className="mt-auto pt-6">
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium font-roboto" 
                        disabled={submitting || !proofFile}
                      >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                            Submitting...
                      </>
                    ) : (
                          'Submit payment'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'confirmation' && (
                  <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 font-roboto">Payment submitted!</h3>
                      <p className="text-muted-foreground font-roboto">Your payment proof has been uploaded and is being reviewed.</p>
                  {paymentId && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground font-roboto">
                            Reference: <span className="font-mono text-foreground">{paymentId}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 