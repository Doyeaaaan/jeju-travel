export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen flex">
      <div className="w-2/3 border-r p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-1/3">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t"></div>
          <div className="h-[calc(100vh-12px)] bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}
