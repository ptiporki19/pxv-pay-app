export default function TestSimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          🎉 Next.js is Working!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          PXV Pay application is running correctly
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <div>✅ Next.js Server Running</div>
          <div>✅ App Router Working</div>
          <div>✅ Components Loading</div>
        </div>
        <div className="pt-4">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
} 