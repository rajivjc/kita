import type { StoryUpdateItem } from '@/lib/story/data'

interface StoryUpdateCardProps {
  update: StoryUpdateItem
}

export default function StoryUpdateCard({ update }: StoryUpdateCardProps) {
  const date = new Date(update.created_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Singapore',
  })

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5" />
        <div className="w-px flex-1 bg-surface-alt" />
      </div>
      <div className="pb-4">
        <p className="text-[10px] text-text-hint font-medium mb-1">{date}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{update.content}</p>
        {update.coach_name && (
          <p className="text-[10px] text-teal-500 font-medium mt-1">
            {update.coach_name}
          </p>
        )}
      </div>
    </div>
  )
}
