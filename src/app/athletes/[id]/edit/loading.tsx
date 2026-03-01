export default function EditAthleteLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-6" />
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="space-y-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        ))}
        <div className="h-10 bg-gray-200 rounded-lg w-full" />
      </div>
    </main>
  )
}
