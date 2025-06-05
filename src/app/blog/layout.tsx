import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - PXV Pay',
  description: 'Compiled notes from the team - Stay updated with the latest insights on global payments, local methods, and fintech innovations.',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 