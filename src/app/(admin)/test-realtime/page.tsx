import { Metadata } from 'next'
import { RealTimeTestPanel } from '@/components/RealTimeTestPanel'
import { NotificationDemo } from '@/components/NotificationDemo'

export const metadata: Metadata = {
  title: 'Real-Time Testing - PXV Pay',
  description: 'Test real-time functionality for PXV Pay',
}

export default function TestRealtimePage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Real-Time Testing</h1>
        <p className="text-muted-foreground mb-8">
          This page allows you to test the real-time functionality between user payment flow and merchant approval flow. 
          Test creating payments and approving them to see real-time updates and notifications.
        </p>
      </div>
      
      <NotificationDemo />
      
      <RealTimeTestPanel />
    </div>
  )
} 