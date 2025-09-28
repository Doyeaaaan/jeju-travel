export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen">
      <div className="p-4 border-b">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="flex justify-end">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
