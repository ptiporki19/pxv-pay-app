import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Features | PXV Pay',
  description: 'Explore the comprehensive features of PXV Pay - global payment methods, security, customization and more.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 