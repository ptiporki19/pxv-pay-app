import { SimpleAnalyticsCards } from '@/components/analytics/simple-analytics-cards'

export default function TestSimpleAnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Simple Analytics Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing the new simple analytics cards with proper multi-currency display
          </p>
        </div>
        
        <SimpleAnalyticsCards />
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Expected Results:</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Geographic Analytics: Should show AUD 78,870 for Cocos Islands, USD 20,000 for Cyprus, CAD 12,000 for Canada</li>
            <li>• Payment Methods: Should show proper currencies for each payment method (AUD for ipay, etc.)</li>
            <li>• Transaction Status: Should show proper currency totals for completed/pending transactions</li>
            <li>• All amounts should be formatted with correct currency codes (not hardcoded USD)</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 