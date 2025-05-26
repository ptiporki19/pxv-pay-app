import { Metadata } from 'next'
import { CreateCheckoutLinkForm } from "@/components/admin/create-checkout-link-form"

export const metadata: Metadata = {
  title: 'Create Checkout Link - PXV Pay',
  description: 'Create a new checkout link for payments',
}

export default function CreateCheckoutLinkPage() {
  return (
    <div className="flex flex-col gap-5">
      <CreateCheckoutLinkForm />
    </div>
  )
} 