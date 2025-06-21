'use client'

import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  variant?: 'button' | 'text'
  className?: string
}

export function LogoutButton({ variant = 'button', className }: LogoutButtonProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
    router.refresh()
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        className={cn(
          "flex w-full items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors",
          className
        )}
      >
        <ArrowRightStartOnRectangleIcon className="mr-2 h-4 w-4" />
        <span>Sign out</span>
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={cn(
        "w-full justify-start text-violet-100 hover:text-white hover:bg-violet-500/60 transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm",
        className
      )}
    >
      <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5" />
      <span className="font-medium">Logout</span>
    </Button>
  )
} 