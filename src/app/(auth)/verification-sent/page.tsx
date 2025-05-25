import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function VerificationSentPage() {
  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <CheckCircle 
            className="h-8 w-8 text-blue-600"
            aria-hidden="true" 
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-sm text-gray-500">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-gray-500">
          Please check your email and click on the verification link to complete your registration.
          The link will expire in 24 hours.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button asChild className="w-full">
          <Link href="/signin">
            Return to sign in
          </Link>
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Didn&apos;t receive an email?{' '}
          <Link
            href="/resend-verification"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Click here to resend
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 