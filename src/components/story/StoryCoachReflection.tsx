import type { StoryCoachReflection as ReflectionType } from '@/lib/story/data'

interface StoryCoachReflectionProps {
  reflection: ReflectionType
}

export default function StoryCoachReflection({ reflection }: StoryCoachReflectionProps) {
  const date = new Date(reflection.created_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Singapore',
  })

  return (
    <blockquote className="border-l-4 border-teal-300 bg-teal-50/50 rounded-r-xl pl-4 pr-4 py-3">
      <p className="text-sm text-gray-700 leading-relaxed italic">
        &ldquo;{reflection.content}&rdquo;
      </p>
      <footer className="mt-2 flex items-center gap-2">
        {reflection.coach_name && (
          <span className="text-xs font-medium text-teal-600">
            {reflection.coach_name}
          </span>
        )}
        <span className="text-[10px] text-gray-400">{date}</span>
      </footer>
    </blockquote>
  )
}
