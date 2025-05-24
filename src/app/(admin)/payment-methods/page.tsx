import { Metadata } from 'next'
import { PaymentMethodsList } from "@/components/admin/payment-methods-list"

export const metadata: Metadata = {
  title: 'Payment Methods - PXV Pay',
  description: 'Manage payment methods in your payment system',
}

export default function PaymentMethodsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PaymentMethodsList />
    </div>
  )
} 