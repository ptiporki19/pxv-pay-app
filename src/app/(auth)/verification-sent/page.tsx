import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerificationSentPage() {
  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-blue-600 dark:text-blue-400"
          >
            <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-3.5" />
            <path d="m14 11-5 3v-6l5 3Z" />
            <path d="M22 2 13 7" />
          </svg>
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Didn&apos;t receive an email?{' '}
          <Link
            href="/resend-verification"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Click here to resend
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 