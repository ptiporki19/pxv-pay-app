import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Make a Payment - PXV Pay',
  description: 'Secure payment processing',
}

export default function PaymentPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Payment Details</h1>
        <p className="text-gray-500 mt-2">Please enter your payment information</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                id="amount"
                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md"
                placeholder="0.00"
                readOnly
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">USD</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">
              Country
            </label>
            <select
              id="country"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md"
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="NG">Nigeria</option>
              <option value="GH">Ghana</option>
              <option value="KE">Kenya</option>
            </select>
          </div>
          
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-4"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
} 