'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      toast.success('Reset link sent', {
        description: 'Check your email for a password reset link.',
      })
      
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error('Reset failed', {
        description: error?.message || 'Failed to send reset email. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            We've sent a password reset link to your email address
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">Email sent successfully!</p>
            <p>Click the link in your email to reset your password. The link will expire in 24 hours.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => {
              setIsSuccess(false)
              form.reset()
            }}
            variant="outline"
            className="w-full border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Send another email
          </Button>
          
          <Link
            href="/signin"
            className="block w-full text-center text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors duration-200"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Your Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Enter your email address and we'll send you a link to reset your password
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
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 border-0 mt-6" 
            disabled={isLoading}
          >
            {isLoading ? 'Sending reset link...' : 'Send reset link'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        Remember your password?{' '}
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