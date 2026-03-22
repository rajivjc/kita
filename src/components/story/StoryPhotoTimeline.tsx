'use client'

import type { MonthlyPhoto } from '@/lib/story/data'

interface StoryPhotoTimelineProps {
  photos: MonthlyPhoto[]
}

export default function StoryPhotoTimeline({ photos }: StoryPhotoTimelineProps) {
  if (photos.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-teal-600 dark:text-teal-300 uppercase tracking-wide mb-3">
        Along the way
      </h2>
      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {photos.map((photo, i) => (
          <figure
            key={i}
            className="flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`${photo.month} ${photo.year}`}
              className="w-24 h-24 rounded-xl object-cover shadow-sm"
              loading="lazy"
            />
            <figcaption className="text-[10px] text-text-hint text-center mt-1">
              {photo.month} {photo.year}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
