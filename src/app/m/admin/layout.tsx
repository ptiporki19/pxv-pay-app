import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - PXV Pay Mobile',
  description: 'Admin interface for PXV Pay mobile',
}

export default function MobileAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 