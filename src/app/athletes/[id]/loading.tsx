export default function AthleteHubLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Back button placeholder */}
      <div className="h-5 w-20 bg-surface-alt rounded animate-pulse mb-4" />

      {/* Athlete name placeholder */}
      <div className="h-8 w-48 bg-surface-alt rounded animate-pulse mb-6" />

      {/* Tab bar placeholder */}
      <div className="flex border-b border-border mb-4 gap-0">
        <div className="flex-1 h-9 bg-surface-alt rounded animate-pulse mx-1" />
        <div className="flex-1 h-9 bg-surface-alt rounded animate-pulse mx-1" />
        <div className="flex-1 h-9 bg-surface-alt rounded animate-pulse mx-1" />
      </div>

      {/* Card placeholders */}
      <div className="space-y-3">
        <div className="h-24 bg-surface-alt rounded-xl animate-pulse" />
        <div className="h-24 bg-surface-alt rounded-xl animate-pulse" />
        <div className="h-24 bg-surface-alt rounded-xl animate-pulse" />
      </div>
    </main>
  )
}
