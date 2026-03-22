import type { NarrativeChapter } from '@/lib/story/narrative'

interface StoryChapterProps {
  chapter: NarrativeChapter
}

export default function StoryChapter({ chapter }: StoryChapterProps) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-3">
        {chapter.title}
      </h2>
      <div className="space-y-2">
        {chapter.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-text-secondary leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      {chapter.milestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chapter.milestones.map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            >
              {m.icon ?? '🏆'} {m.label}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
