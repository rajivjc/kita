export default function NotificationsLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-8 w-32 bg-surface-alt rounded animate-pulse mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border-subtle shadow-sm px-4 py-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-surface-alt rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-surface-alt rounded-md w-3/4 mb-2" />
                <div className="h-3 bg-surface-alt rounded-md w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
