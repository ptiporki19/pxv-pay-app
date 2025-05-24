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
      
      // Fetch user profile to check role
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        // Fallback: redirect to regular dashboard if we can't determine role
        toast.success('Signed in successfully', {
          description: 'Redirecting to your dashboard...',
        })
        router.push('/dashboard')
        router.refresh()
        return
      }

      // Determine redirect path based on actual user role
      const isSuperAdmin = userProfile.role === 'super_admin'
      const redirectPath = isSuperAdmin ? '/super-admin' : '/dashboard'

      toast.success('Signed in successfully', {
        description: `Redirecting to your ${isSuperAdmin ? 'super admin ' : ''}dashboard...`,
      })

      // Redirect to the appropriate dashboard based on the user's role
      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
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
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your credentials to access your account
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password" 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button variant="outline" className="w-full" onClick={() => {/* Handle OAuth login */}} disabled={isLoading}>
        <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
        </svg>
        Google
      </Button>
      
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Sign up
        </Link>
      </div>
      
      <Button 
        variant="link" 
        className="w-full mt-2"
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/')
        }}
      >
        Return to landing page
      </Button>
    </div>
  )
} 