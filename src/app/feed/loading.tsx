export default function FeedLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Greeting card skeleton */}
      <div className="rounded-2xl px-5 py-5 mb-5 bg-surface-raised border border-border-subtle animate-pulse">
        <div className="h-5 bg-surface-alt rounded-md w-48 mb-3" />
        <div className="h-4 bg-surface-alt/70 rounded-md w-64 mb-3" />
        <div className="space-y-2">
          <div className="h-10 bg-surface-alt/50 rounded-lg" />
          <div className="h-10 bg-surface-alt/50 rounded-lg" />
        </div>
      </div>

      {/* Weekly summary skeleton */}
      <div className="bg-surface border border-border-subtle rounded-xl px-4 py-3 mb-5 shadow-sm flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-surface-alt" />
        <div className="flex-1">
          <div className="h-4 bg-surface-alt rounded-md w-32 mb-1.5" />
          <div className="h-3 bg-surface-alt rounded-md w-48" />
        </div>
      </div>

      {/* Section header skeleton */}
      <div className="h-3 bg-surface-alt rounded w-16 mb-3 mt-1 animate-pulse" />

      {/* Session card skeletons */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border-subtle shadow-sm px-4 py-4 border-l-[5px] border-l-gray-100 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-3 bg-surface-alt rounded-md w-24 mb-2" />
                <div className="h-5 bg-surface-alt rounded-md w-32" />
              </div>
              <div className="w-8 h-8 bg-surface-alt rounded-full" />
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <div className="h-7 bg-surface-alt rounded-md w-16" />
              <div className="h-4 bg-surface-alt rounded-md w-12" />
            </div>
            <div className="h-3 bg-surface-alt rounded-md w-20 mb-3" />
            <div className="h-px bg-surface-alt my-2" />
            <div className="h-3 bg-surface-alt rounded-md w-12" />
          </div>
        ))}
      </div>
    </main>
  )
}
