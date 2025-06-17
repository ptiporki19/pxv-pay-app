'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Globe, LockKeyhole, ArrowRight } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  
  // On page load, sign out to clear any previous session
  useEffect(() => {
    const clearSession = async () => {
      await supabase.auth.signOut()
    }
    clearSession()
  }, [supabase.auth])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        throw error
      }
      
      console.log('✅ Authentication successful:', {
        userId: data.user.id,
        email: data.user.email
      })

      // Get user profile to determine role-based redirect
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        console.log('📋 User profile check:', {
          profileData: profile,
          profileError: profileError?.message,
          role: profile?.role
        })

        const isSuperAdmin = profile?.role === 'super_admin'
        const redirectTo = isSuperAdmin ? '/super-admin' : '/dashboard'
        
        console.log('🎯 Redirect decision:', {
          role: profile?.role,
          isSuperAdmin,
          redirectTo
        })

        toast.success('Signed in successfully', {
          description: `Redirecting to ${isSuperAdmin ? 'super admin' : 'your'} dashboard...`,
        })

        // Direct redirect based on role
        router.push(redirectTo)
        router.refresh()
        
      } catch (profileError) {
        console.error('❌ Profile fetch failed, using default redirect:', profileError)
        
        toast.success('Signed in successfully', {
          description: 'Redirecting to your dashboard...',
        })
        
        // Fallback to default dashboard
        router.push('/dashboard')
        router.refresh()
      }
      
    } catch (error: any) {
      console.error('❌ Sign in failed:', error)
      toast.error('Sign in failed', {
        description: error?.message || 'Failed to sign in. Please check your credentials.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Sign in to your PXV Pay account to manage your global payment operations
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="pl-10 bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type="password" 
                      disabled={isLoading}
                      className="pl-10 bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 border-0 mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/70 dark:bg-gray-900/70 px-2 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full border-gray-200 dark:border-gray-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300" 
        onClick={() => {/* Handle OAuth login */}} 
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
        </svg>
        Google
      </Button>
      
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors duration-200"
        >
          Sign up for PXV Pay
        </Link>
      </div>
    </div>
  )
} 