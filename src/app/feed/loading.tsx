export default function FeedLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Greeting skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Section header skeleton */}
      <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse" />

      {/* Feed card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full w-10 h-10 bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </main>
  )
}
