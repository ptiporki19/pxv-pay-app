'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SignOutPage() {
  const router = useRouter()
  const supabase = createClient()
  
  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut()
    }
    signOut()
  }, [supabase.auth])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Signing Out...</h1>
      <p className="mb-8 text-gray-600">You have been signed out successfully.</p>
      <Button 
        onClick={() => router.push('/')}
        className="w-full max-w-xs"
      >
        Return to Home Page
      </Button>
    </div>
  )
} 