"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Crown, User, Mail, Calendar, DollarSign, CreditCard, Globe, Coins, MoreHorizontal, Shield, UserCheck, UserX, CheckCircle, XCircle, AlertCircle, TrendingUp, Eye, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  status: string
  countries: string[]
  created_at: string
}

interface Country {
  id: string
  name: string
  code: string
  status: string
  created_at: string
}

interface Currency {
  id: string
  name: string
  code: string
  symbol: string
  status: string
  created_at: string
}

interface UserStats {
  totalPayments: number
  totalAmount: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  uniqueCurrencies: number
  activePaymentMethods: number
  activeCountries: number
  accountAge: number
}

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Modal states
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false)
  const [paymentMethodsModalOpen, setPaymentMethodsModalOpen] = useState(false)
  const [countriesModalOpen, setCountriesModalOpen] = useState(false)
  const [currenciesModalOpen, setCurrenciesModalOpen] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

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
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('User fetch error:', userError)
        throw new Error(`Failed to fetch user: ${userError.message}`)
      }
      setUser(userData)

      // Fetch payments for this user
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.warn('Could not fetch payments:', paymentsError.message)
        setPayments([])
      } else {
        setPayments(paymentsData || [])
      }

      // Fetch payment methods for this user
      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (paymentMethodsError) {
        console.warn('Could not fetch payment methods:', paymentMethodsError.message)
        setPaymentMethods([])
      } else {
        setPaymentMethods(paymentMethodsData || [])
      }

      // Fetch countries for this user
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (countriesError) {
        console.warn('Could not fetch countries:', countriesError.message)
        setCountries([])
      } else {
        setCountries(countriesData || [])
      }

      // Fetch currencies for this user
      const { data: currenciesData, error: currenciesError } = await supabase
        .from('currencies')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (currenciesError) {
        console.warn('Could not fetch currencies:', currenciesError.message)
        setCurrencies([])
      } else {
        setCurrencies(currenciesData || [])
      }

      // Calculate stats
      if (userData) {
        const totalPayments = (paymentsData || []).length
        const totalAmount = (paymentsData || []).reduce((sum, payment) => sum + payment.amount, 0)
        const successfulPayments = (paymentsData || []).filter(p => p.status === 'completed').length
        const pendingPayments = (paymentsData || []).filter(p => p.status === 'pending').length
        const failedPayments = (paymentsData || []).filter(p => p.status === 'failed').length
        const uniqueCurrencies = new Set((paymentsData || []).map(p => p.currency)).size
        const activePaymentMethods = (paymentMethodsData || []).filter(pm => pm.status === 'active').length
        const activeCountries = (countriesData || []).filter(c => c.status === 'active').length
        const accountAge = Math.floor((new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))

        setStats({
          totalPayments,
          totalAmount,
          successfulPayments,
          pendingPayments,
          failedPayments,
          uniqueCurrencies,
          activePaymentMethods,
          activeCountries,
          accountAge
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
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setUser(prev => prev ? { ...prev, role: newRole } : null)
      toast({ title: "Success", description: "User role updated successfully" })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update role", 
        variant: "destructive" 
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!user) return
    
    const newStatus = !user.active
    const action = newStatus ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setUser(prev => prev ? { ...prev, active: newStatus } : null)
      toast({ title: "Success", description: `User ${action}d successfully` })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update status", 
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-black text-white dark:bg-white dark:text-black'
      case 'subscriber':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'registered_user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  const getStatusBadgeClass = (active: boolean) => {
    return active 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  // Widget Component
  const StatWidget = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    onClick, 
    variant = "default" 
  }: {
    title: string
    value: string | number
    icon: any
    description: string
    onClick?: () => void
    variant?: "default" | "success" | "warning" | "danger"
  }) => {
    const variantClasses = {
      default: "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
      success: "border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600",
      warning: "border-yellow-200 hover:border-yellow-300 dark:border-yellow-700 dark:hover:border-yellow-600",
      danger: "border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600"
    }

    return (
      <div 
        className={`
          relative p-6 border rounded-lg transition-all duration-200 bg-white dark:bg-gray-900
          ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
          ${variantClasses[variant]}
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        {onClick && (
          <div className="absolute top-2 right-2">
            <Eye className="h-4 w-4 text-muted-foreground opacity-50" />
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium">User not found</p>
          <p className="text-muted-foreground mb-4">The requested user profile could not be found.</p>
          <Link href="/users">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">View and manage user account information</p>
        </div>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {user.role === 'super_admin' ? (
              <Crown className="h-6 w-6 text-yellow-600" />
            ) : (
              <User className="h-6 w-6" />
            )}
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <div className="mt-1">
                <Badge className={getRoleBadgeClass(user.role)}>
                  {user.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                  {user.role === 'super_admin' ? 'Super Admin' : 
                   user.role === 'subscriber' ? 'Subscriber' : 'User'}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
              <div className="mt-1">
                <Badge className={getStatusBadgeClass(user.active)}>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Actions</Label>
              <div className="mt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isUpdating}>
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Manage
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
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(user.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Account age: {stats?.accountAge || 0} days
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Widgets */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget
            title="Total Payments"
            value={stats.totalPayments}
            icon={DollarSign}
            description={`${formatCurrency(stats.totalAmount, currencies[0]?.code || 'USD')} total volume`}
            onClick={() => setPaymentsModalOpen(true)}
            variant="default"
          />
          
          <StatWidget
            title="Payment Methods"
            value={paymentMethods.length}
            icon={CreditCard}
            description={`${stats.activePaymentMethods} active methods`}
            onClick={() => setPaymentMethodsModalOpen(true)}
            variant="default"
          />
          
          <StatWidget
            title="Countries"
            value={countries.length}
            icon={Globe}
            description={`${stats.activeCountries} active regions`}
            onClick={() => setCountriesModalOpen(true)}
            variant="default"
          />
          
          <StatWidget
            title="Currencies"
            value={currencies.length}
            icon={Coins}
            description={`${stats.uniqueCurrencies} used in payments`}
            onClick={() => setCurrenciesModalOpen(true)}
            variant="default"
          />
        </div>
      )}

      {/* Performance Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatWidget
            title="Successful Payments"
            value={stats.successfulPayments}
            icon={CheckCircle}
            description={`${stats.totalPayments > 0 ? Math.round((stats.successfulPayments / stats.totalPayments) * 100) : 0}% success rate`}
            variant="success"
          />
          
          <StatWidget
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={AlertCircle}
            description="Awaiting processing"
            variant="warning"
          />
          
          <StatWidget
            title="Failed Payments"
            value={stats.failedPayments}
            icon={XCircle}
            description="Failed transactions"
            variant="danger"
          />
        </div>
      )}

      {/* Modals */}
      
      {/* Payments Modal */}
      <Dialog open={paymentsModalOpen} onOpenChange={setPaymentsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment History ({payments.length} total)
            </DialogTitle>
            <DialogDescription>
              Complete payment transaction history for this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPaymentStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-sm text-muted-foreground">{payment.payment_method}</p>
                      {payment.description && (
                        <p className="text-xs text-muted-foreground">{payment.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                      {payment.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(payment.created_at)}
                    </p>
                    {payment.country && (
                      <p className="text-xs text-muted-foreground">{payment.country}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No payments found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Modal */}
      <Dialog open={paymentMethodsModalOpen} onOpenChange={setPaymentMethodsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods ({paymentMethods.length} configured)
            </DialogTitle>
            <DialogDescription>
              Available payment methods for this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{method.type}</p>
                    {method.countries.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Available in: {method.countries.join(', ')}
                      </p>
                    )}
                  </div>
                  <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                    {method.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No payment methods configured</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Countries Modal */}
      <Dialog open={countriesModalOpen} onOpenChange={setCountriesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Countries ({countries.length} configured)
            </DialogTitle>
            <DialogDescription>
              Available countries for this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-2">
            {countries.length > 0 ? (
              countries.map((country) => (
                <div key={country.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{country.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({country.code})</span>
                  </div>
                  <Badge variant={country.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {country.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No countries configured</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Currencies Modal */}
      <Dialog open={currenciesModalOpen} onOpenChange={setCurrenciesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Currencies ({currencies.length} configured)
            </DialogTitle>
            <DialogDescription>
              Available currencies for this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-2">
            {currencies.length > 0 ? (
              currencies.map((currency) => (
                <div key={currency.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{currency.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({currency.code}) {currency.symbol}
                    </span>
                  </div>
                  <Badge variant={currency.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {currency.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No currencies configured</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 