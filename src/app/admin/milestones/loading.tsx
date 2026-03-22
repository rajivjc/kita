export default function MilestonesLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-4 w-16 bg-surface-alt rounded animate-pulse mb-4" />
      <div className="h-8 w-48 bg-surface-alt rounded animate-pulse mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border-subtle shadow-sm px-4 py-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-alt rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-surface-alt rounded-md w-40 mb-2" />
                <div className="h-3 bg-surface-alt rounded-md w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
