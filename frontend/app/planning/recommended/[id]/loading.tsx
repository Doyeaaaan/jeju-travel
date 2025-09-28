export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen flex">
      <div className="w-2/3 border-r">
        <div className="animate-pulse">
          <div className="p-4 border-b">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-64 bg-gray-200"></div>
          <div className="p-6 border-b">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/3">
        <div className="animate-pulse">
          <div className="p-4 border-b">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-[calc(100vh-56px)] bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}
