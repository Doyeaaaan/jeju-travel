export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen">
      <div className="p-4 border-b">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-12"></div>
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
              <div className="space-y-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 mt-0.5"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="flex justify-between items-center">
              <div className="space-y-2 w-1/3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
              <div className="h-6 bg-gray-200 rounded w-8"></div>
              <div className="bg-white p-4 rounded-lg shadow-sm w-1/3">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="mt-6">
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
