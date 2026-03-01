export default function NotificationsLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
