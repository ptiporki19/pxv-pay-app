"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Crown, User, Mail, Calendar, DollarSign, CreditCard, MoreHorizontal, Shield, UserCheck, UserX, CheckCircle, XCircle, AlertCircle, Eye, Activity, Link2, Clock, Copy, Download, FileText, Image as ImageIcon, ExternalLink, TrendingUp, Receipt, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"

interface User {
  id: string
  email: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
}

interface Payment {
  id: string
  amount: number
  currency: string
  payment_method: string
  status: string
  country?: string
  description?: string
  created_at: string
  updated_at?: string
  reference?: string
  customer_name?: string
  customer_email?: string
  payment_proof_url?: string
  metadata?: any
  fee_amount?: number
  net_amount?: number
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  status: string
  countries: string[]
  created_at: string
}

interface CheckoutLink {
  id: string
  title: string
  slug: string
  amount: number
  amount_type: 'fixed' | 'flexible'
  min_amount?: number | null
  max_amount?: number | null
  currency: string
  status: string
  active_country_codes: string[]
  created_at: string
}

interface UserStats {
  totalPayments: number
  totalAmount: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  activePaymentMethods: number
  activeCheckoutLinks: number
  accountAge: number
  averageTransactionAmount: number
  lastTransactionDate?: string
}

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  console.log('🔍 UserProfile component mounted with userId:', userId, 'type:', typeof userId)
  const [user, setUser] = useState<User | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLink[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Modal states - simplified
  const [selectedTransaction, setSelectedTransaction] = useState<Payment | null>(null)
  const [transactionDetailModalOpen, setTransactionDetailModalOpen] = useState(false)
  const [proofImageModalOpen, setProofImageModalOpen] = useState(false)
  const [selectedProofUrl, setSelectedProofUrl] = useState<string>('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
    
    // Set up real-time subscription for user data
    const subscription = supabase
      .channel('user-profile-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${userId}`
        }, 
        () => {
          fetchUserProfile()
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'payments',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          fetchUserProfile()
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'checkout_links',
          filter: `merchant_id=eq.${userId}`
        }, 
        () => {
          fetchUserProfile()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      
      // First check if userId is valid
      if (!userId || userId.trim() === '') {
        throw new Error('Invalid user ID provided - user ID is required')
      }
      
      // Additional validation for UUID format (basic check) - temporarily relaxed
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        console.warn(`⚠️ User ID format warning: ${userId} - proceeding anyway for testing`)
        // throw new Error(`Invalid user ID format: ${userId}`)
      }
      
      console.log('🔍 Fetching user profile for ID:', userId)
      
      // Fetch user details via API (uses service role, bypasses RLS)
      const response = await fetch(`/api/users/${userId}/profile`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }))
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`Failed to fetch user: ${errorData.error || 'API request failed'}`)
      }
      
      const apiResult = await response.json()
      console.log('📋 API Response:', apiResult)
      
      const userData = apiResult.user
      
      if (!userData) {
        console.error('❌ No user data in API response:', apiResult)
        throw new Error(`No user data returned for ID: ${userId}`)
      }
      
      console.log('✅ User profile loaded successfully:', userData)
      setUser(userData)

      // Fetch ALL payments for this user - both as customer (user_id) and merchant (merchant_id)
      const { data: customerPayments, error: customerPaymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const { data: merchantPayments, error: merchantPaymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('merchant_id', userId)
        .order('created_at', { ascending: false })

      // Combine both types of payments and remove duplicates
      const allPayments: Payment[] = []
      if (customerPayments && !customerPaymentsError) {
        allPayments.push(...customerPayments)
      }
      if (merchantPayments && !merchantPaymentsError) {
        // Add merchant payments that aren't already in the list
        merchantPayments.forEach(payment => {
          if (!allPayments.some(p => p.id === payment.id)) {
            allPayments.push(payment)
          }
        })
      }

      // Sort by creation date descending
      allPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      console.log(`Fetched payments for user ${userId}:`, {
        customer: customerPayments?.length || 0,
        merchant: merchantPayments?.length || 0,
        total: allPayments.length
      })

      setPayments(allPayments)

      // Fetch payment methods
      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (paymentMethodsError) {
        console.error('Payment methods fetch error:', paymentMethodsError)
      } else {
        setPaymentMethods(paymentMethodsData || [])
      }

      // Fetch checkout links
      const { data: checkoutLinksData, error: checkoutLinksError } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('merchant_id', userId)
        .order('created_at', { ascending: false })

      if (checkoutLinksError) {
        console.error('Checkout links fetch error:', checkoutLinksError)
      } else {
        setCheckoutLinks(checkoutLinksData || [])
      }

      // Calculate enhanced stats
      if (userData) {
        const totalPayments = allPayments.length
        const totalAmount = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
        const successfulPayments = allPayments.filter(p => p.status === 'completed').length
        const pendingPayments = allPayments.filter(p => p.status === 'pending' || p.status === 'pending_verification').length
        const failedPayments = allPayments.filter(p => p.status === 'failed').length
        const activePaymentMethods = (paymentMethodsData || []).filter(pm => pm.status === 'active').length
        const activeCheckoutLinks = (checkoutLinksData || []).filter(cl => cl.status === 'active').length
        const accountAge = Math.floor((new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
        const averageTransactionAmount = totalPayments > 0 ? totalAmount / totalPayments : 0
        const lastTransactionDate = allPayments.length > 0 ? allPayments[0].created_at : undefined

        setStats({
          totalPayments,
          totalAmount,
          successfulPayments,
          pendingPayments,
          failedPayments,
          activePaymentMethods,
          activeCheckoutLinks,
          accountAge,
          averageTransactionAmount,
          lastTransactionDate
        })
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUser(prev => prev ? { ...prev, role: newRole } : null)
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!user) return
    
    try {
      setIsUpdating(true)
      
      const newStatus = !user.active
      
      const { error } = await supabase
        .from('users')
        .update({ active: newStatus })
        .eq('id', userId)

      if (error) throw error

      setUser(prev => prev ? { ...prev, active: newStatus } : null)
      
      toast({
        title: "Success",
        description: `User account ${newStatus ? 'activated' : 'deactivated'}`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (isNaN(amount)) {
      return `0 ${currency}`
    }
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
    
    return `${formattedAmount} ${currency}`
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 'subscriber':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeClass = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
      case 'pending_verification':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`,
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const openTransactionDetail = (transaction: Payment) => {
    setSelectedTransaction(transaction)
    setTransactionDetailModalOpen(true)
  }

  const openProofOfPayment = (url: string) => {
    setSelectedProofUrl(url)
    setProofImageModalOpen(true)
  }

  // Enhanced Metric Card Component
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    subtitle,
    trend,
    variant = "default",
    className = ""
  }: {
    title: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    subtitle?: string
    trend?: { value: number; label: string }
    variant?: "default" | "success" | "warning" | "danger"
    className?: string
  }) => {
    const variantClasses = {
      default: "border-border",
      success: "border-green-200 bg-green-50/50",
      warning: "border-yellow-200 bg-yellow-50/50", 
      danger: "border-red-200 bg-red-50/50"
    }

    const iconClasses = {
      default: "text-muted-foreground",
      success: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-red-600"
    }

    return (
      <Card className={cn("transition-all duration-200 hover:shadow-md", variantClasses[variant], className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span className={trend.value > 0 ? 'text-green-600' : 'text-red-600'}>
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-background">
              <Icon className={cn("h-6 w-6", iconClasses[variant])} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Spinner size="lg" className="mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading Profile</p>
            <p className="text-sm text-muted-foreground">Fetching user information and analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">User Not Found</h3>
              <p className="text-sm text-muted-foreground">
                The requested user profile could not be found.
              </p>
            </div>
            <Link href="/users">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getUserInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/users">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        </div>
        
        {/* Loading Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center py-8">
          <Spinner size="md" className="mx-auto" />
          <p className="mt-2 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    )
  }

  // Show error state if no user found
  if (!user) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/users">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        </div>
        
        {/* Error Card */}
        <Card className="border-2 border-red-200">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
              <p className="text-gray-600 mb-4">
                The user with ID "{userId}" could not be found in the database.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This could happen if:
              </p>
              <ul className="text-sm text-gray-500 text-left max-w-md mx-auto mb-6">
                <li>• The user ID is invalid or malformed</li>
                <li>• The user has been deleted</li>
                <li>• There's a database connectivity issue</li>
              </ul>
              <div className="flex gap-2 justify-center">
                <Link href="/users">
                  <Button variant="outline">
                    Back to Users List
                  </Button>
                </Link>
                <Button onClick={() => fetchUserProfile()} variant="default">
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header - Outside of card, matching create payment method page */}
      <div className="flex items-center justify-between">
        <Link href="/users">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
      </div>

      {/* User Header Card - More prominent and informative */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getUserInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{user.email}</h2>
                  <Badge className={getRoleBadgeClass(user.role)}>
                    {user.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                    {user.role === 'super_admin' ? 'Super Admin' : 
                     user.role === 'subscriber' ? 'Subscriber' : 'User'}
                  </Badge>
                  <Badge className={getStatusBadgeClass(user.active)}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {stats?.accountAge || 0} days old
                  </div>
                  {stats?.lastTransactionDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Last active {formatDate(stats.lastTransactionDate)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isUpdating} className="gap-2">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleRoleChange('registered_user')}>
                  <User className="mr-2 h-4 w-4" />
                  Make User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('subscriber')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Make Subscriber
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('super_admin')}>
                  <Crown className="mr-2 h-4 w-4" />
                  Make Super Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleStatusToggle}
                  className={user.active ? 'text-red-600' : 'text-green-600'}
                >
                  {user.active ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                  {user.active ? 'Deactivate Account' : 'Activate Account'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid - Simplified and more visual */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(stats.totalAmount)}
            icon={DollarSign}
            subtitle={`${stats.totalPayments} total transactions`}
            variant="success"
          />
          
          <MetricCard
            title="Success Rate"
            value={`${stats.totalPayments > 0 ? Math.round((stats.successfulPayments / stats.totalPayments) * 100) : 0}%`}
            icon={CheckCircle}
            subtitle={`${stats.successfulPayments} successful payments`}
            variant="success"
          />
          
          <MetricCard
            title="Pending"
            value={stats.pendingPayments}
            icon={Clock}
            subtitle="Awaiting processing"
            variant="warning"
          />
          
          <MetricCard
            title="Average Transaction"
            value={formatCurrency(stats.averageTransactionAmount)}
            icon={TrendingUp}
            subtitle="Per transaction average"
            variant="default"
          />
        </div>
      )}

      {/* Tabbed Interface for better organization */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="products">
            Products
          </TabsTrigger>
          <TabsTrigger value="checkout-links">
            Checkout Links
          </TabsTrigger>
          <TabsTrigger value="payment-methods">
            Payment Methods
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Overview */}
            <div className="bg-card rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">Products Created</div>
                    <div className="text-2xl font-bold text-gray-900">{checkoutLinks.length}</div>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">Payment Methods</div>
                    <div className="text-2xl font-bold text-gray-900">{paymentMethods.length}</div>
                  </div>
                </div>
                
                {stats && stats.totalPayments > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium">Payment Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Successful</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round((stats.successfulPayments / stats.totalPayments) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {Math.round((stats.pendingPayments / stats.totalPayments) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Failed</span>
                        <span className="text-sm font-medium text-red-600">
                          {Math.round((stats.failedPayments / stats.totalPayments) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Analytics */}
            {payments.length > 0 && (
              <div className="bg-card rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Transaction Analytics</h3>
                  
                  {/* Currency Breakdown */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium">Revenue by Currency</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {Object.entries(
                        payments.reduce((acc, payment) => {
                          const currency = payment.currency || 'USD'
                          acc[currency] = (acc[currency] || 0) + payment.amount
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([currency, amount]) => (
                        <div key={currency} className="flex justify-between items-center p-2 bg-background rounded text-sm">
                          <span className="font-medium">{currency}</span>
                          <span className="font-mono">{formatCurrency(amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Payment Methods */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Top Payment Methods</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {Object.entries(
                        payments.reduce((acc, payment) => {
                          const method = payment.payment_method || 'Unknown'
                          acc[method] = (acc[method] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).slice(0, 5).map(([method, count]) => (
                        <div key={method} className="flex justify-between items-center p-2 bg-background rounded text-sm">
                          <span>{method}</span>
                          <span className="font-medium">{count} transactions</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Recent Transactions</h2>
                  <p className="text-sm text-muted-foreground">
                    View all payment transactions and their status
                  </p>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <div className="border rounded-lg">
                    {/* Table Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
                      <div className="w-[120px]">ID</div>
                      <div className="w-[100px]">Date</div>
                      <div className="w-[140px]">Customer</div>
                      <div className="w-[100px]">Amount</div>
                      <div className="w-[100px]">Method</div>
                      <div className="w-[100px]">Status</div>
                      <div className="w-[80px] text-right">Actions</div>
                    </div>
                    
                    {/* Table Body */}
                      {payments.length > 0 ? (
                        payments.slice(0, 10).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <div className="w-[120px]">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                                {payment.id.slice(0, 8)}...
                              </div>
                              {payment.reference && (
                              <div className="text-xs text-gray-500 font-roboto">
                                  Ref: {payment.reference}
                                </div>
                              )}
                          </div>
                          <div className="w-[100px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">{formatDate(payment.created_at)}</span>
                          </div>
                          <div className="w-[140px]">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                                {payment.customer_name || payment.customer_email?.split('@')[0] || 'N/A'}
                              </div>
                              {payment.customer_email && (
                              <div className="text-xs text-gray-500 font-roboto">
                                  {payment.customer_email}
                                </div>
                              )}
                          </div>
                          <div className="w-[100px]">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{formatCurrency(payment.amount, payment.currency)}</span>
                          </div>
                          <div className="w-[100px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">{payment.payment_method}</span>
                          </div>
                          <div className="w-[100px]">
                            <Badge variant="outline" className={cn(getPaymentStatusBadgeClass(payment.status), "font-roboto")}>
                                {payment.status}
                              </Badge>
                          </div>
                          <div className="w-[80px] text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => openTransactionDetail(payment)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Details</span>
                              </Button>
                          </div>
                        </div>
                        ))
                      ) : (
                      <div className="px-4 py-12 text-center">
                            <div className="text-gray-500">
                          <div className="text-lg font-medium mb-2 font-roboto">No transactions found</div>
                          <div className="text-sm font-roboto">Transactions will appear here once payments are processed.</div>
                            </div>
                      </div>
                      )}
                  </div>
                </div>
              </div>

              {payments.length > 10 && (
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                  <div className="font-roboto">Showing 10 of {payments.length} transactions</div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold font-roboto">Products</h2>
                  <p className="text-sm text-muted-foreground font-roboto">
                    Manage product offerings and configurations
                  </p>
                </div>
              </div>

              {checkoutLinks.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <div className="border rounded-lg">
                      {/* Table Header */}
                      <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
                        <div className="w-[160px]">Product Name</div>
                        <div className="w-[120px]">Pricing</div>
                        <div className="w-[120px]">URL Slug</div>
                        <div className="w-[100px]">Status</div>
                        <div className="w-[80px] text-right">Actions</div>
                      </div>
                      
                      {/* Table Body */}
                        {checkoutLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <div className="w-[160px]">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{link.title}</span>
                          </div>
                          <div className="w-[120px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                              {link.amount_type === 'fixed' 
                                ? formatCurrency(link.amount, link.currency)
                                : `${formatCurrency(link.min_amount || 0, link.currency)} - ${formatCurrency(link.max_amount || 0, link.currency)}`
                              }
                            </span>
                          </div>
                          <div className="w-[120px]">
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-roboto">/{link.slug}</code>
                          </div>
                          <div className="w-[100px]">
                            <Badge variant={link.status === 'active' ? 'default' : 'secondary'} className="font-roboto">
                                {link.status}
                              </Badge>
                          </div>
                          <div className="w-[80px] text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => window.open(`/c/${link.slug}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">Open Link</span>
                                </Button>
                              </div>
                        </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2 font-roboto">No products found</div>
                    <div className="text-sm font-roboto">Products will appear here once they are created.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Checkout Links Tab */}
        <TabsContent value="checkout-links" className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold font-roboto">Checkout Links</h2>
                  <p className="text-sm text-muted-foreground font-roboto">
                    Direct payment links and checkout configurations
                  </p>
                </div>
              </div>

              {checkoutLinks.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <div className="border rounded-lg">
                      {/* Table Header */}
                      <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
                        <div className="w-[140px]">Link Title</div>
                        <div className="w-[100px]">Amount</div>
                        <div className="w-[120px]">Countries</div>
                        <div className="w-[100px]">Created</div>
                        <div className="w-[100px]">Status</div>
                        <div className="w-[80px] text-right">Actions</div>
                      </div>
                      
                      {/* Table Body */}
                        {checkoutLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <div className="w-[140px]">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{link.title}</span>
                          </div>
                          <div className="w-[100px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                              {link.amount_type === 'fixed' 
                                ? formatCurrency(link.amount, link.currency)
                                : 'Flexible'
                              }</span></div>
                          <div className="w-[120px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                                {link.active_country_codes.length} countries
                              </span>
                          </div>
                          <div className="w-[100px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">{formatDate(link.created_at)}</span>
                          </div>
                          <div className="w-[100px]">
                            <Badge variant={link.status === 'active' ? 'default' : 'secondary'} className="font-roboto">
                                {link.status}
                              </Badge>
                          </div>
                          <div className="w-[80px] text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => window.open(`/c/${link.slug}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">Open Link</span>
                                </Button>
                              </div>
                        </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2 font-roboto">No checkout links found</div>
                    <div className="text-sm font-roboto">Checkout links will appear here once they are created.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Payment Methods</h2>
                  <p className="text-sm text-muted-foreground">
                    Configured payment methods and their availability
                  </p>
                </div>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <div className="border rounded-lg">
                      {/* Table Header */}
                      <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
                        <div className="w-[160px]">Method Name</div>
                        <div className="w-[120px]">Type</div>
                        <div className="w-[120px]">Countries</div>
                        <div className="w-[100px]">Created</div>
                        <div className="w-[100px]">Status</div>
                        <div className="w-[80px] text-right">Actions</div>
                      </div>
                      
                      {/* Table Body */}
                        {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <div className="w-[160px]">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{method.name}</span>
                          </div>
                          <div className="w-[120px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">{method.type} payment</span>
                          </div>
                          <div className="w-[120px]">
                              <div className="max-h-20 overflow-y-auto">
                                {method.countries.length > 0 ? (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-roboto">
                                    {method.countries.slice(0, 2).join(', ')}
                                    {method.countries.length > 2 && ` +${method.countries.length - 2} more`}
                                  </span>
                                ) : (
                                <span className="text-gray-500 font-roboto">All countries</span>
                                )}
                              </div>
                          </div>
                          <div className="w-[100px]">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">{formatDate(method.created_at)}</span>
                          </div>
                          <div className="w-[100px]">
                            <Badge variant={method.status === 'active' ? 'default' : 'secondary'} className="font-roboto">
                                {method.status}
                              </Badge>
                          </div>
                          <div className="w-[80px] text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Details</span>
                              </Button>
                          </div>
                        </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2 font-roboto">No payment methods found</div>
                    <div className="text-sm font-roboto">Payment methods will appear here once they are configured.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal - Enhanced to match payment verification */}
      <Dialog open={transactionDetailModalOpen} onOpenChange={setTransactionDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Payment Proof Verification
            </DialogTitle>
            <DialogDescription>
              Review payment proof submitted by {selectedTransaction?.customer_name || selectedTransaction?.customer_email?.split('@')[0] || 'customer'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Payment Details Section */}
              <div>
                <h3 className="font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Customer:</Label>
                    <div className="mt-1">
                      <div className="font-medium">{selectedTransaction.customer_name || selectedTransaction.customer_email?.split('@')[0] || 'N/A'}</div>
                      {selectedTransaction.customer_email && (
                        <div className="text-sm text-gray-600">{selectedTransaction.customer_email}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Transaction ID:</Label>
                    <div className="mt-1">
                      <div className="text-sm font-mono text-gray-900">{selectedTransaction.id}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Amount:</Label>
                    <div className="mt-1">
                      <div className="text-lg font-semibold">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Payment Method:</Label>
                    <div className="mt-1">
                      <div>{selectedTransaction.payment_method}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Country:</Label>
                    <div className="mt-1">
                      <div>{selectedTransaction.country || 'Not specified'}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Submitted:</Label>
                    <div className="mt-1">
                      <div>{formatDate(selectedTransaction.created_at)}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status:</Label>
                    <div className="mt-1">
                      <Badge className={getPaymentStatusBadgeClass(selectedTransaction.status)}>
                        {selectedTransaction.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {selectedTransaction.reference && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Reference:</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="text-sm font-mono">{selectedTransaction.reference}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(selectedTransaction.reference || '', "Reference")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedTransaction.description && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700">Description:</Label>
                    <div className="mt-1 p-3 bg-background rounded-md text-sm">
                      {selectedTransaction.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Proof Image Section */}
              {selectedTransaction.payment_proof_url && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Payment Proof Image</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openProofOfPayment(selectedTransaction.payment_proof_url!)}
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Enlarge Image
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-background">
                    <div className="flex items-center justify-center min-h-[200px]">
                      <Image
                        src={selectedTransaction.payment_proof_url}
                        alt="Payment Proof"
                        width={400}
                        height={300}
                        className="object-contain max-h-[300px] rounded cursor-pointer"
                        onClick={() => openProofOfPayment(selectedTransaction.payment_proof_url!)}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              )}

              {!selectedTransaction.payment_proof_url && (
                <div>
                  <h3 className="font-semibold mb-4">Payment Proof Image</h3>
                  <div className="border rounded-lg p-8 bg-background text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No proof of payment uploaded</p>
                  </div>
                </div>
              )}

              {/* Additional Transaction Info */}
              {(selectedTransaction.fee_amount || selectedTransaction.net_amount) && (
                <div>
                  <h3 className="font-semibold mb-4">Transaction Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTransaction.fee_amount && (
                      <div className="p-3 bg-background rounded-md">
                        <Label className="text-sm font-medium text-gray-700">Transaction Fee:</Label>
                        <div className="text-lg font-medium">{formatCurrency(selectedTransaction.fee_amount, selectedTransaction.currency)}</div>
                      </div>
                    )}
                    
                    {selectedTransaction.net_amount && (
                      <div className="p-3 bg-background rounded-md">
                        <Label className="text-sm font-medium text-gray-700">Net Amount:</Label>
                        <div className="text-lg font-medium text-green-600">{formatCurrency(selectedTransaction.net_amount, selectedTransaction.currency)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proof of Payment Image Modal - Unchanged */}
      <Dialog open={proofImageModalOpen} onOpenChange={setProofImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Proof of Payment</DialogTitle>
            <DialogDescription>
              Transaction proof uploaded by the customer
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedProofUrl && (
              <div className="relative max-w-full max-h-[70vh] overflow-auto">
                <Image
                  src={selectedProofUrl}
                  alt="Proof of Payment"
                  width={800}
                  height={600}
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 