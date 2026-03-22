export default function DigestLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-6 w-48 bg-surface-alt rounded animate-pulse" />
        <div className="h-4 w-32 bg-surface-alt rounded animate-pulse mt-2" />
      </div>

      {/* Opening paragraph skeleton */}
      <div className="h-5 bg-surface-alt rounded animate-pulse w-full mb-2" />
      <div className="h-5 bg-surface-alt rounded animate-pulse w-3/4 mb-6" />

      {/* Divider */}
      <div className="border-t border-border-subtle my-6" />

      {/* Section header skeleton */}
      <div className="h-3 w-20 bg-surface-alt rounded animate-pulse mb-4" />

      {/* Highlight items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-5 h-5 bg-surface-alt rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-surface-alt rounded-md w-full mb-2" />
              <div className="h-4 bg-surface-alt rounded-md w-2/3 mb-1" />
              <div className="h-3 bg-surface-alt rounded-md w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle my-6" />

      {/* Closing skeleton */}
      <div className="h-4 bg-surface-alt rounded animate-pulse w-48" />
    </main>
  )
}
