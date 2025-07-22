import { toast } from 'sonner'

/**
 * Mobile-optimized toast notifications
 * Compact design for mobile screens while maintaining desktop styling consistency
 */
export const mobileToast = {
  success: (title: string, description?: string) => 
    toast.success(title, {
      description,
      duration: 2500,
      position: 'bottom-center',
      className: 'mobile-toast mobile-toast-success',
      style: {
        maxWidth: '280px',
        minHeight: '48px',
        padding: '8px 12px',
        fontSize: '14px',
        lineHeight: '1.3',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        background: '#10b981',
        color: 'white',
        border: 'none'
      }
    }),
    
  error: (title: string, description?: string) => 
    toast.error(title, {
      description,
      duration: 3500,
      position: 'bottom-center',
      className: 'mobile-toast mobile-toast-error',
      style: {
        maxWidth: '280px',
        minHeight: '48px',
        padding: '8px 12px',
        fontSize: '14px',
        lineHeight: '1.3',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        background: '#ef4444',
        color: 'white',
        border: 'none'
      }
    }),
    
  info: (title: string, description?: string) => 
    toast.info(title, {
      description,
      duration: 2500,
      position: 'bottom-center',
      className: 'mobile-toast mobile-toast-info',
      style: {
        maxWidth: '280px',
        minHeight: '48px',
        padding: '8px 12px',
        fontSize: '14px',
        lineHeight: '1.3',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        background: '#3b82f6',
        color: 'white',
        border: 'none'
      }
    })
}

/**
 * Predefined toast messages for common actions
 */
export const mobileToastMessages = {
  // Checkout Links
  checkoutLink: {
    created: () => mobileToast.success('Checkout link created successfully'),
    updated: () => mobileToast.success('Checkout link updated successfully'),
    deleted: () => mobileToast.success('Checkout link deleted successfully'),
    copied: () => mobileToast.success('Checkout link copied to clipboard'),
    createError: (error?: string) => mobileToast.error('Failed to create checkout link', error),
    updateError: (error?: string) => mobileToast.error('Failed to update checkout link', error),
    deleteError: (error?: string) => mobileToast.error('Failed to delete checkout link', error)
  },
  
  // Payment Methods
  paymentMethod: {
    created: () => mobileToast.success('Payment method created successfully'),
    updated: () => mobileToast.success('Payment method updated successfully'),
    deleted: () => mobileToast.success('Payment method deleted successfully'),
    statusUpdated: () => mobileToast.success('Payment method status updated'),
    imageUploaded: () => mobileToast.success('Payment method image uploaded'),
    imageRemoved: () => mobileToast.success('Payment method image removed'),
    createError: (error?: string) => mobileToast.error('Failed to create payment method', error),
    updateError: (error?: string) => mobileToast.error('Failed to update payment method', error),
    deleteError: (error?: string) => mobileToast.error('Failed to delete payment method', error),
    uploadError: (error?: string) => mobileToast.error('Failed to upload image', error)
  },
  
  // Brands
  brand: {
    created: () => mobileToast.success('Brand created successfully'),
    updated: () => mobileToast.success('Brand updated successfully'),
    deleted: () => mobileToast.success('Brand deleted successfully'),
    createError: (error?: string) => mobileToast.error('Failed to create brand', error),
    updateError: (error?: string) => mobileToast.error('Failed to update brand', error),
    deleteError: (error?: string) => mobileToast.error('Failed to delete brand', error)
  },
  
  // Products
  product: {
    created: () => mobileToast.success('Product created successfully'),
    updated: () => mobileToast.success('Product updated successfully'),
    deleted: () => mobileToast.success('Product deleted successfully'),
    createError: (error?: string) => mobileToast.error('Failed to create product', error),
    updateError: (error?: string) => mobileToast.error('Failed to update product', error),
    deleteError: (error?: string) => mobileToast.error('Failed to delete product', error)
  },
  
  // Verification
  verification: {
    approved: () => mobileToast.success('Payment approved successfully'),
    rejected: () => mobileToast.success('Payment rejected successfully'),
    submitted: () => mobileToast.success('Payment verification submitted'),
    approveError: (error?: string) => mobileToast.error('Failed to approve payment', error),
    rejectError: (error?: string) => mobileToast.error('Failed to reject payment', error),
    loadError: (error?: string) => mobileToast.error('Failed to load payment verifications', error)
  },
  
  // General
  general: {
    copied: () => mobileToast.success('Copied to clipboard'),
    authError: () => mobileToast.error('You must be logged in'),
    networkError: () => mobileToast.error('Network error. Please try again'),
    validationError: (error?: string) => mobileToast.error('Validation error', error),
    loadError: (resource?: string) => mobileToast.error(`Failed to load ${resource || 'data'}`)
  }
}