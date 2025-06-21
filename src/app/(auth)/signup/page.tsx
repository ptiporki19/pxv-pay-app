'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Mail, LockKeyhole, CheckCircle, ArrowRight } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Please enter your full name'),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      terms: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      
      // Use server action for signup
      const { signUpAction } = await import('@/app/actions/auth')
      
      const result = await signUpAction({
        email: values.email,
        password: values.password,
        fullName: values.fullName
      })

      if (result.success) {
        toast.success('Account created successfully', {
          description: 'Please check your email to verify your account.',
        })
        router.push('/signin')
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error('Sign up failed', {
        description: error?.message || 'Failed to create your account. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join PXV Pay</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Start accepting global payments with local methods in minutes
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="pl-10 bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
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
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type="password" 
                      disabled={isLoading}
                      placeholder="Create a strong password"
                      className="pl-10 bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500" 
                    />
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type="password" 
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      className="pl-10 bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500" 
                    />
                    <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-200"
                    >
                      terms of service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-200"
                    >
                      privacy policy
                    </Link>
                  </FormLabel>
                  <FormMessage className="text-red-500" />
                </div>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 border-0 mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            By creating an account, you'll gain access to PXV Pay's payment platform where you can configure payment methods and accept payments from customers globally.
          </div>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link
          href="/signin"
          className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors duration-200"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
} 