export default function EditAthleteLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-4 w-24 bg-surface-alt rounded animate-pulse mb-6" />
      <div className="h-8 w-32 bg-surface-alt rounded animate-pulse mb-6" />
      <div className="space-y-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 w-20 bg-surface-alt rounded mb-1" />
            <div className="h-10 bg-surface-alt rounded-lg" />
          </div>
        ))}
        <div className="h-10 bg-surface-alt rounded-lg w-full" />
      </div>
    </main>
  )
}
