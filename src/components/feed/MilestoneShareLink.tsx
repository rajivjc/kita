'use client'

export default function MilestoneShareLink({ milestoneId }: { milestoneId: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        window.open(`/milestone/${milestoneId}`, '_blank', 'noopener,noreferrer')
      }}
      className="ml-0.5 text-amber-400 hover:text-amber-600 bg-transparent border-none p-0 cursor-pointer"
      title="Share this milestone"
      aria-label="Share this milestone"
    >
      ↗
    </button>
  )
}
