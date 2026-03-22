export default function SettingsLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-4 w-16 bg-surface-alt rounded animate-pulse mb-4" />
      <div className="h-8 w-32 bg-surface-alt rounded animate-pulse mb-6" />
      <div className="bg-surface rounded-xl border border-border-subtle p-6 space-y-4 animate-pulse">
        <div className="h-5 w-28 bg-surface-alt rounded" />
        <div className="h-10 bg-surface-alt rounded-lg" />
        <div className="h-5 w-28 bg-surface-alt rounded" />
        <div className="h-10 bg-surface-alt rounded-lg" />
        <div className="h-10 bg-surface-alt rounded-lg w-24" />
      </div>
    </main>
  )
}
