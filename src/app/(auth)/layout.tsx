import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication - PXV Pay',
  description: 'Authentication pages for PXV Pay',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex flex-col justify-center p-8 md:p-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">PXV Pay</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Empowering global payments with local methods
            </p>
          </div>
          {children}
        </div>
      </div>
      
      {/* Right side - Image or gradient */}
      <div className="hidden md:block relative bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-6 text-center">
            <h2 className="text-3xl font-bold">Welcome to PXV Pay</h2>
            <p>
              A modern, secure, and user-friendly payment collection platform.
              Simplify cross-border transactions with local payment methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 