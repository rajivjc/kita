export default function LoginLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm animate-pulse space-y-4">
        <div className="h-7 w-48 mx-auto rounded bg-surface-alt" />
        <div className="mt-8 space-y-4">
          <div className="h-9 rounded bg-surface-alt" />
          <div className="h-9 rounded bg-surface-alt" />
        </div>
      </div>
    </main>
  )
}
