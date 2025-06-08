import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Blog | PXV Pay',
  description: 'Explore the latest insights, guides, and industry news from the PXV Pay team.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 