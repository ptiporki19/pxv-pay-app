import { Metadata } from 'next'
import { MobileLayout } from '@/components/mobile/layout/MobileLayout'

export const metadata: Metadata = {
  title: 'PXV Pay Mobile',
  description: 'PXV Pay mobile interface',
}

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MobileLayout>{children}</MobileLayout>
} 