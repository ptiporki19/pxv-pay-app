'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
  Camera,
  X
} from 'lucide-react'

interface MobileCheckoutFormProps {
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

type CheckoutStep = 'details' | 'payment-methods' | 'payment-details' | 'proof-upload' | 'confirmation'

// Truncated description component with modal trigger
const TruncatedDescription = ({
  description,
  onViewMore
}: {
  description: string;
  onViewMore: () => void;
}) => {
  if (!description) return null
  
  // Split into words and limit to one line (about 8-10 words for mobile)
  const words = description.split(' ')
  const maxWords = 10
  const shouldTruncate = words.length > maxWords
  const truncatedText = shouldTruncate
    ? words.slice(0, maxWords).join(' ') + '...'
    : description
  
  return (
    <div className="text-xs text-muted-foreground px-2">
      <div className="flex items-center justify-center gap-1">
        <span className="font-lato text-center">{truncatedText}</span>
        {shouldTruncate && (
          <button
            type="button"
            onClick={onViewMore}
            className="text-foreground dark:text-foreground hover:text-foreground dark:hover:text-foreground transition-colors text-xs font-medium font-lato underline flex-shrink-0"
          >
            View more
          </button>
        )}
      </div>
    </div>
  )
}

// Product Description Modal Component
const ProductDescriptionModal = ({
  isOpen,
  onClose,
  productName,
  productImage,
  description
}: {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
  description: string;
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg max-w-sm w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground font-lato truncate">
            {productName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* Product Image */}
          {productImage && (
            <div className="p-4 pb-2">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            </div>
          )}
          
          {/* Product Description */}
          <div className="p-4 pt-2">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line font-lato">
              {description}
            </div>
          </div>
        </div>
        
        {/* Modal Footer - removed the large Close button as requested, keeping only the X button in the header */}
        <div className="p-4"></div>
      </div>
    </div>
  )
}

// Mobile-specific animations
const MobileAnimations = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Mobile-optimized floating elements */}
      <div className="absolute animate-pulse opacity-10">
        <div className="w-1 h-1 bg-foreground/20 rounded-full" style={{ 
          left: '15%', 
          top: '25%',
          animationDelay: '0s',
          animationDuration: '4s'
        }}></div>
      </div>
      <div className="absolute animate-pulse opacity-15">
        <div className="w-1.5 h-1.5 bg-foreground/15 rounded-full" style={{ 
          left: '85%', 
          top: '35%',
          animationDelay: '1s',
          animationDuration: '3s'
        }}></div>
      </div>
      <div className="absolute animate-pulse opacity-10">
        <div className="w-1 h-1 bg-foreground/10 rounded-full" style={{ 
          left: '70%', 
          top: '60%',
          animationDelay: '2s',
          animationDuration: '5s'
        }}></div>
      </div>
    </div>
  )
}

export function MobileCheckoutForm({ slug }: MobileCheckoutFormProps) {
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
  
  // Mobile-specific state
  const [stepAnimation, setStepAnimation] = useState('fade-in')
  const [headerHeight, setHeaderHeight] = useState('40vh') // Reduced from 50vh to 40vh for better button visibility
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function validateCheckout() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/checkout/${slug}/validate`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to validate checkout')
        if (!data.valid) throw new Error('Checkout link is not valid or inactive')
        
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
      toast.success('Copied!', { 
        description: 'Copied to clipboard',
        duration: 2000 
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy', { duration: 2000 });
    }
  };

  const handleStepTransition = (newStep: CheckoutStep) => {
    // Set appropriate animation based on step
    if (newStep === 'confirmation') {
      setStepAnimation('fade-down-out')
    } else {
      setStepAnimation('fade-up-out')
    }
    
    setTimeout(() => {
      setCurrentStep(newStep)
      // Update header height based on step - reduced heights for better button visibility
      if (newStep === 'details') {
        setHeaderHeight('40vh') // Reduced from 50vh to 40vh
      } else if (newStep === 'confirmation') {
        setHeaderHeight('60px') // Minimal header for confirmation with just back button space
      } else {
        setHeaderHeight('25vh') // Reduced from 33.33vh to 25vh for other steps
      }
      
      // Set appropriate in animation
      if (newStep === 'confirmation') {
        setStepAnimation('fade-down-in')
      } else {
        setStepAnimation('fade-up-in')
      }
    }, 150)
  }

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
      handleStepTransition('payment-methods')
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
      window.location.href = selectedPaymentMethod.url;
      return;
    }
    
    handleStepTransition('payment-details');
  }

  const handleProceedToUpload = () => {
    handleStepTransition('proof-upload')
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
      const formData = new FormData()
      formData.append('proof', proofFile)
      formData.append('checkout_link_id', checkoutData.checkout_link.id)
      formData.append('customer_name', customerName)
      formData.append('customer_email', customerEmail)
      formData.append('country', selectedCountry)
      formData.append('payment_method_id', selectedPaymentMethod?.id || '')
      
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
      handleStepTransition('confirmation')

    } catch (err) {
      console.error('Payment submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit payment')
    } finally {
      setSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details': return 'Complete your payment'
      case 'payment-methods': return 'Payment Method'
      case 'payment-details': return 'Payment Info'
      case 'proof-upload': return 'Upload Proof'
      case 'confirmation': return 'Complete!'
      default: return 'Checkout'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'details': return 'Enter your information to continue'
      case 'payment-methods': return 'Choose your preferred payment method'
      case 'payment-details': return 'Complete payment using the details below'
      case 'proof-upload': return 'Upload screenshot or proof of your payment'
      case 'confirmation': return 'Payment has been submitted successfully you will receive an email after aproval'
      default: return ''
    }
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

  // Get custom text or default
  const getDisplayText = () => {
    if (checkoutLink?.custom_text) {
      return checkoutLink.custom_text
    }
    if (checkoutLink?.checkout_type === 'product') {
      return checkoutLink.product_name || 'Complete your purchase'
    }
    return 'Complete your payment'
  }

  // Get product image for display - using same logic as desktop
  const getProductImage = () => {
    if (checkoutLink?.checkout_type === 'product' && checkoutLink?.product_image_url) {
      return checkoutLink.product_image_url
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground font-lato">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="flex items-center gap-2 text-destructive justify-center mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!checkoutLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="flex items-center gap-2 text-destructive justify-center">
            <AlertCircle className="h-5 w-5" />
            <span>Checkout link not found</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background relative overflow-hidden flex flex-col fixed inset-0">
      <MobileAnimations />
      
      {/* Mobile Header */}
      <div
        className="relative z-10 bg-muted/30 border-b border-border transition-all duration-300 flex items-center"
        style={{ height: headerHeight }}
      >
        <div className="px-3 py-4 w-full">
          {/* Back Button - show on all steps except details */}
          {currentStep !== 'details' && (
            <button
              onClick={() => {
                if (currentStep === 'payment-methods') {
                  handleStepTransition('details')
                } else if (currentStep === 'payment-details') {
                  handleStepTransition('payment-methods')
                } else if (currentStep === 'proof-upload') {
                  handleStepTransition('payment-details')
                } else if (currentStep === 'confirmation') {
                  // For confirmation, go back to initial checkout page (details)
                  handleStepTransition('details')
                }
              }}
              className="absolute left-3 top-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {/* Brand Header - hide on confirmation page to avoid redundancy */}
          {currentStep !== 'confirmation' && (
            <div className="text-center mb-3">
              {checkoutData?.brand ? (
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img
                    src={checkoutData.brand.logo_url}
                    alt={checkoutData.brand.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-base font-normal text-foreground font-lato truncate">
                    {checkoutData.brand.name}
                  </div>
                </div>
              ) : (
                <div className="text-base text-muted-foreground font-lato mb-2">
                  PXV Pay
                </div>
              )}
            </div>
          )}
            
            {/* Product Image Display - only on initial step for product checkouts */}
            {currentStep === 'details' && getProductImage() && (
              <div className="mb-4">
                <img
                  src={getProductImage()}
                  alt={getDisplayText()}
                  className="w-full max-w-[200px] h-32 rounded-lg object-cover mx-auto border border-border"
                />
              </div>
            )}
            
            {/* Custom Text Display - immediately below brand/product - hide on confirmation */}
            {currentStep !== 'confirmation' && (
              <h2 className="text-lg font-medium text-foreground mb-2 font-lato px-2 text-center">
                {currentStep === 'details'
                  ? getDisplayText()
                  : 'Complete your payment'}
              </h2>
            )}
            {currentStep === 'details' && getCurrentAmount() && currency && (
              <div className="text-xl font-semibold text-foreground font-lato mb-3 text-center">
                {getCurrentAmount()} {currency.code}
              </div>
            )}
            
            {/* Product Description - truncated with modal only on initial step */}
            {currentStep === 'details' && checkoutLink?.checkout_type === 'product' && checkoutLink?.product_description && (
              <div className="mb-2 text-center">
                <TruncatedDescription
                  description={checkoutLink.product_description}
                  onViewMore={() => setIsModalOpen(true)}
                />
              </div>
            )}

          {/* Step Header - hide on confirmation */}
          {currentStep !== 'confirmation' && (
            <div className="text-center">
              <h1 className="text-base font-medium text-foreground mb-1 font-lato">{getStepTitle()}</h1>
              <p className="text-sm text-muted-foreground font-lato">{getStepDescription()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 p-4 transition-all duration-300 overflow-hidden",
        stepAnimation === 'fade-up-out' ? 'opacity-0 transform translate-y-4' :
        stepAnimation === 'fade-up-in' ? 'opacity-100 transform translate-y-0' :
        stepAnimation === 'fade-down-out' ? 'opacity-0 transform -translate-y-4' :
        stepAnimation === 'fade-down-in' ? 'opacity-100 transform translate-y-0' :
        'opacity-100 transform translate-y-0'
      )}>
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive text-sm mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium text-foreground mb-2 block font-lato">Full name</Label>
              <Input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customerEmail" className="text-sm font-medium text-foreground mb-2 block font-lato">Email address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter your email address"
                className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="country" className="text-sm font-medium text-foreground mb-2 block font-lato">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-sm font-lato">
                      {c.name} ({c.currency?.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {checkoutLink.amount_type === 'flexible' && (
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-foreground mb-2 block font-lato">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pr-16 text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                    required
                  />
                  {currency && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-muted-foreground text-sm font-lato">
                        {currency.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        )}

        {currentStep === 'payment-methods' && (
          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payment methods available for {selectedCountryData?.name}</p>
              </div>
            ) : (
              paymentMethods.sort((a,b) => a.display_order - b.display_order).map((method) => (
                <div 
                  key={method.id} 
                  className={cn(
                    "rounded-lg p-4 cursor-pointer transition-all duration-200 border min-h-[60px] flex items-center",
                    selectedPaymentMethod?.id === method.id
                      ? "border-border bg-muted/70 shadow-sm"
                      : "border-border hover:border-muted-foreground hover:bg-muted/30"
                  )}
                  onClick={() => handlePaymentMethodSelect(method)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      selectedPaymentMethod?.id === method.id
                        ? "border-foreground bg-foreground"
                        : "border-muted-foreground"
                    )}>
                      {selectedPaymentMethod?.id === method.id && (
                        <div className="w-2 h-2 rounded-full bg-background"></div>
                      )}
                    </div>
                    {method.image_url ? (
                      <img src={method.image_url} alt={method.name} className="w-8 h-8 object-cover rounded flex-shrink-0"/>
                    ) : method.icon_url ? (
                      <img src={method.icon_url} alt={method.name} className="w-6 h-6 object-contain flex-shrink-0"/>
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{method.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate font-lato">{method.name}</h4>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {currentStep === 'payment-details' && selectedPaymentMethod && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border">
              <h3 className="text-xs font-medium text-foreground text-center mb-3 font-lato">Send payment to:</h3>
              
              {selectedPaymentMethod.instructions_for_checkout && (
                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Instructions:</h4>
                  <div className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-line">
                    {selectedPaymentMethod.instructions_for_checkout}
                  </div>
                </div>
              )}
              
              {selectedPaymentMethod.account_details && selectedPaymentMethod.account_details.length > 0 ? (
                <div className="space-y-2">
                  {selectedPaymentMethod.account_details.map((field, index) => (
                    <div key={field.id || index} className="flex items-center justify-between p-3 bg-background rounded border">
                      <div className="text-sm font-medium text-foreground flex-1 min-w-0">
                        {field.label}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-sm font-medium text-foreground font-mono max-w-[120px] truncate">
                          {field.value}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleCopy(field.value)} 
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors flex-shrink-0" 
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedPaymentMethod.additional_info && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">{selectedPaymentMethod.additional_info}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Payment method information will be displayed here</p>
                </div>
              )}
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border-0 dark:border-0 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Next Step</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    After payment, take a screenshot and upload it on the next page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'proof-upload' && (
          <form onSubmit={handleProofUpload} className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2 font-lato">Upload Payment Proof</h3>
                  <p className="text-xs text-muted-foreground mb-4 font-lato">Take a screenshot of your payment confirmation</p>
                  
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-0 dark:border-0 rounded-lg text-center">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">Include in your proof</p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 text-center space-y-1">
                      <li> Transaction amount and date</li>
                      <li> Payment reference number</li>
                      <li> Confirmation status</li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Camera Button */}
                    <div className="flex flex-col items-center">
                      <label className="w-full">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const maxSize = 10 * 1024 * 1024
                              if (file.size > maxSize) {
                                setError('File size must be less than 10MB')
                                e.target.value = ''
                                return
                              }
                              setError(null)
                              setProofFile(file)
                            }
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-10 text-sm font-normal"
                          onClick={() => document.querySelector('input[capture="environment"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </label>
                    </div>
                    
                    {/* File Upload Button */}
                    <div className="flex flex-col items-center">
                      <label className="w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const maxSize = 10 * 1024 * 1024
                              if (file.size > maxSize) {
                                setError('File size must be less than 10MB')
                                e.target.value = ''
                                return
                              }
                              setError(null)
                              setProofFile(file)
                            }
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-10 text-sm font-normal"
                          onClick={() => document.querySelector('input[accept="image/*,.pdf"]:not([capture])')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </label>
                    </div>
                  </div>
                    
                  {proofFile && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-800 dark:text-green-200 truncate">{proofFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofFile(null)}
                        className="p-1 text-green-600 dark:text-green-400 items-center hover:text-green-800 dark:hover:text-green-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {currentStep === 'confirmation' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center space-y-6 px-4">
            {/* Brand Header - moved above confirmation text */}
            <div className="text-center mb-2">
              {checkoutData?.brand ? (
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img
                    src={checkoutData.brand.logo_url}
                    alt={checkoutData.brand.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-base font-normal text-foreground font-lato truncate">
                    {checkoutData.brand.name}
                  </div>
                </div>
              ) : (
                <div className="text-base text-muted-foreground font-lato mb-2">
                  PXV Pay
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground font-lato">Complete!</h1>
              <p className="text-base text-muted-foreground font-lato max-w-sm">
                Payment has been submitted successfully you will receive an email after approval
              </p>
            </div>
            
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground font-lato">Payment Submitted!</h3>
              <p className="text-base text-muted-foreground font-lato">Your payment is being reviewed.</p>
              
              {paymentId && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-sm w-full">
                  <p className="text-sm text-muted-foreground">
                    Reference: <span className="font-mono text-foreground text-xs break-all">{paymentId}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Redirect Button */}
            {checkoutLink?.redirect_url && (
              <div className="space-y-3 w-full max-w-sm">
                {checkoutLink.redirect_message && (
                  <p className="text-sm text-muted-foreground">{checkoutLink.redirect_message}</p>
                )}
                <Button
                  onClick={() => window.location.href = checkoutLink.redirect_url}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-normal text-base font-lato rounded-lg"
                >
                  {checkoutLink.redirect_button_text || 'Continue'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {currentStep !== 'confirmation' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background">
          <Button
            onClick={() => {
              if (currentStep === 'details') {
                const form = document.querySelector('form') as HTMLFormElement
                form?.requestSubmit()
              } else if (currentStep === 'payment-methods') {
                handleProceedToDetails()
              } else if (currentStep === 'payment-details') {
                handleProceedToUpload()
              } else if (currentStep === 'proof-upload') {
                const form = document.querySelector('form') as HTMLFormElement
                form?.requestSubmit()
              }
            }}
            disabled={
              submitting ||
              (currentStep === 'payment-methods' && !selectedPaymentMethod) ||
              (currentStep === 'proof-upload' && !proofFile)
            }
            className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-normal text-sm font-lato"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                {currentStep === 'proof-upload' ? 'Submitting...' : 'Loading...'}
              </>
            ) : (
              currentStep === 'details' ? 'Continue' :
              currentStep === 'payment-methods' ? (
                selectedPaymentMethod?.type === 'payment_link' ? `Pay with ${selectedPaymentMethod.name}` : 'Continue'
              ) :
              currentStep === 'payment-details' ? 'Continue to Upload' :
              'Submit Payment'
            )}
          </Button>
        </div>
      )}

      {/* Product Description Modal */}
      <ProductDescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={getDisplayText()}
        productImage={getProductImage() || undefined}
        description={checkoutLink?.product_description || ''}
      />
    </div>
  )
}
