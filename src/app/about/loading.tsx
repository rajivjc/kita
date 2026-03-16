export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center p-6 py-12">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl px-8 py-10 sm:px-12 sm:py-14 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-8" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-4/6 bg-gray-100 rounded" />
          <div className="h-6 w-32 bg-gray-200 rounded my-6" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}
