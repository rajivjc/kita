'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { useClubConfig } from '@/components/providers/ClubConfigProvider'
import { formatSessionDate, formatSessionTime } from '@/lib/sessions/datetime'
import { caregiverAthleteRsvp } from '@/lib/sessions/rsvp-actions'
import type { CaregiverSessionRsvpCardData, CaregiverRsvpAthleteData } from '@/lib/feed/types'

interface Props {
  card: CaregiverSessionRsvpCardData
}

export default function CaregiverRsvpCard({ card }: Props) {
  const { timezone } = useClubConfig()
  const { session, athletes } = card
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'attending' | 'not_attending'>>(
    Object.fromEntries(athletes.map(a => [a.athleteId, a.rsvpStatus]))
  )
  const [isPending, startTransition] = useTransition()

  const dateStr = formatSessionDate(session.sessionStart, timezone)
  const timeStr = formatSessionTime(session.sessionStart, timezone)
  const title = session.title ?? 'Training'

  const allResponded = Object.values(statuses).every(s => s !== 'pending')
  const isSingle = athletes.length === 1

  const handleRsvp = (athleteId: string, status: 'attending' | 'not_attending') => {
    setStatuses(prev => ({ ...prev, [athleteId]: status })) // Optimistic
    startTransition(async () => {
      const result = await caregiverAthleteRsvp(session.id, athleteId, status)
      if (result.error) {
        setStatuses(prev => ({ ...prev, [athleteId]: 'pending' }))
      }
    })
  }

  const handleUndo = (athleteId: string) => {
    setStatuses(prev => ({ ...prev, [athleteId]: 'pending' }))
  }

  const handleChangeAll = () => {
    setStatuses(Object.fromEntries(athletes.map(a => [a.athleteId, 'pending' as const])))
  }

  // All responded — compact summary
  if (allResponded) {
    return (
      <div className="bg-surface rounded-xl border border-border-subtle border-l-[5px] border-l-accent shadow-sm overflow-hidden">
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar size={14} className="text-accent shrink-0" />
            <span className="text-[13px] font-bold text-text-primary">
              {title} — {dateStr}, {timeStr}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted mb-2.5">
            <MapPin size={12} className="shrink-0" />
            {session.location}
          </div>
          {athletes.map(a => (
            <div key={a.athleteId} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] text-text-secondary">{a.athleteName}</span>
                {statuses[a.athleteId] === 'attending' ? (
                  <span className="text-xs font-semibold text-accent">Attending</span>
                ) : (
                  <span className="text-xs font-semibold text-red-600">Not attending</span>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2 mt-1 border-t border-border-subtle">
            <button
              onClick={handleChangeAll}
              className="text-xs text-accent font-semibold bg-transparent border-none cursor-pointer min-h-[44px] px-2 flex items-center"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Single athlete pending state
  if (isSingle) {
    const athlete = athletes[0]
    const athleteStatus = statuses[athlete.athleteId]

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

          <div className="text-[13px] text-text-secondary mb-2.5 font-medium">
            Will <strong className="text-text-primary">{athlete.athleteName}</strong> be attending?
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleRsvp(athlete.athleteId, 'attending')}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold rounded-lg bg-accent text-white border-none cursor-pointer min-h-[44px]"
            >
              <CheckCircle size={16} /> Attending
            </button>
            <button
              onClick={() => handleRsvp(athlete.athleteId, 'not_attending')}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold rounded-lg bg-surface text-text-secondary border border-border cursor-pointer min-h-[44px]"
            >
              <XCircle size={16} /> Not Attending
            </button>
          </div>

          <div className="flex justify-end pt-2 border-t border-border-subtle">
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

  // Multi-athlete — batched card
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
        <div className="flex items-center gap-1 text-xs text-text-muted mb-3.5">
          <MapPin size={12} className="shrink-0" />
          {session.location}
        </div>

        {athletes.map((a, i) => {
          const s = statuses[a.athleteId]
          const isLast = i === athletes.length - 1
          return (
            <div
              key={a.athleteId}
              className={`flex items-center justify-between py-2 ${!isLast ? 'border-b border-border-subtle' : ''}`}
            >
              <span className="text-sm font-semibold text-text-primary" style={{ minWidth: 80 }}>
                {a.athleteName}
              </span>
              {s === 'pending' ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleRsvp(a.athleteId, 'attending')}
                    disabled={isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md bg-accent text-white border-none cursor-pointer min-h-[36px]"
                  >
                    <CheckCircle size={14} /> Attending
                  </button>
                  <button
                    onClick={() => handleRsvp(a.athleteId, 'not_attending')}
                    disabled={isPending}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-surface text-text-secondary border border-border cursor-pointer min-h-[36px]"
                  >
                    <XCircle size={14} /> Not
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {s === 'attending' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                      <CheckCircle size={14} /> Attending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                      <XCircle size={14} /> Not
                    </span>
                  )}
                  <button
                    onClick={() => handleUndo(a.athleteId)}
                    className="text-[11px] text-text-hint bg-transparent border-none cursor-pointer underline min-h-[36px] px-1 flex items-center"
                  >
                    undo
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <div className="flex justify-end pt-2.5 mt-1.5 border-t border-border-subtle">
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
