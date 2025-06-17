'use client'

import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  
  const handleLogout = async () => {
    // Call the API to sign out
    const res = await fetch('/api/auth/signout', {
      method: 'POST',
    })
    
    // Also sign out on the client
    await supabase.auth.signOut()
    
    if (res.ok) {
      router.push('/signin')
      router.refresh()
    }
  }
  
  return (
    <DropdownMenuItem onSelect={(e) => {
      e.preventDefault()
      handleLogout()
    }}>
      Log out
    </DropdownMenuItem>
  )
} 