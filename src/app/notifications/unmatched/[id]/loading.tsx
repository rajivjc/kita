export default function UnmatchedRunLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mb-4" />
      <div className="h-8 w-44 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded-lg w-full mt-4" />
      </div>
    </main>
  )
}
