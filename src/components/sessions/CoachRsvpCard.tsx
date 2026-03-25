'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { useClubConfig } from '@/components/providers/ClubConfigProvider'
import { formatSessionDate, formatSessionTime } from '@/lib/sessions/datetime'
import { coachRsvp } from '@/lib/sessions/rsvp-actions'
import type { CoachRsvpCardData } from '@/lib/feed/types'

interface Props {
  card: CoachRsvpCardData
}

export default function CoachRsvpCard({ card }: Props) {
  const { timezone } = useClubConfig()
  const { session, coachCount, athleteCount } = card
  const [status, setStatus] = useState<'pending' | 'available' | 'unavailable'>(card.rsvpStatus)
  const [isPending, startTransition] = useTransition()

  const dateStr = formatSessionDate(session.sessionStart, timezone)
  const timeStr = formatSessionTime(session.sessionStart, timezone)
  const title = session.title ?? 'Training'

  const handleRsvp = (newStatus: 'available' | 'unavailable') => {
    setStatus(newStatus) // Optimistic update
    startTransition(async () => {
      const result = await coachRsvp(session.id, newStatus)
      if (result.error) {
        setStatus('pending') // Revert on error
      }
    })
  }

  const handleChange = () => {
    setStatus('pending')
  }

  // Responded state — compact
  if (status !== 'pending') {
    return (
      <div className="bg-surface rounded-xl border border-border-subtle border-l-[5px] border-l-accent shadow-sm overflow-hidden">
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar size={14} className="text-accent shrink-0" />
            <span className="text-[13px] font-bold text-text-primary">
              {title} — {dateStr}, {timeStr}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
            <MapPin size={12} className="shrink-0" />
            {session.location}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {status === 'available' ? (
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent">
                  <CheckCircle size={16} /> Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-600">
                  <XCircle size={16} /> Not available
                </span>
              )}
            </div>
            <button
              onClick={handleChange}
              className="text-xs text-accent font-semibold bg-transparent border-none cursor-pointer min-h-[44px] px-2 flex items-center"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pending state — full card with action buttons
  return (
    <div className="bg-surface rounded-xl border border-border-subtle shadow-sm overflow-hidden"
      style={{ borderLeftWidth: 5, borderLeftColor: '#F59E0B' }}
    >
      <div className="px-3.5 py-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar size={14} className="text-amber-600 shrink-0" />
          <span className="text-sm font-bold text-text-primary">
            {title} — {dateStr}, {timeStr}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
          <MapPin size={12} className="shrink-0" />
          {session.location}
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleRsvp('available')}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold rounded-lg bg-accent text-white border-none cursor-pointer min-h-[44px] transition-all duration-150"
          >
            <CheckCircle size={16} /> Available
          </button>
          <button
            onClick={() => handleRsvp('unavailable')}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold rounded-lg bg-surface text-text-secondary border border-border cursor-pointer min-h-[44px] transition-all duration-150"
          >
            <XCircle size={16} /> Not Available
          </button>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
          <span className="text-xs text-text-muted">
            {coachCount} coach{coachCount !== 1 ? 'es' : ''} · {athleteCount} athlete{athleteCount !== 1 ? 's' : ''} so far
          </span>
          <Link
            href={`/sessions/${session.id}`}
            className="flex items-center gap-0.5 text-xs font-semibold text-accent"
          >
            View details <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
