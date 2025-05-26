import { Metadata } from 'next'
import { CheckoutLinksList } from "@/components/admin/checkout-links-list"

export const metadata: Metadata = {
  title: 'Checkout Links - PXV Pay',
  description: 'Manage your checkout links for payments',
}

export default function CheckoutLinksPage() {
  return (
    <div className="flex flex-col gap-5">
      <CheckoutLinksList />
    </div>
  )
} 