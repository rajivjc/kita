'use client'

import { MapPin } from 'lucide-react'
import { useClubConfig } from '@/components/providers/ClubConfigProvider'
import { formatSessionTime, isSessionToday } from '@/lib/sessions/datetime'
import type { CaregiverSessionConfirmedCardData } from '@/lib/feed/types'

interface Props {
  card: CaregiverSessionConfirmedCardData
}

export default function CaregiverSessionDayCard({ card }: Props) {
  const { timezone } = useClubConfig()
  const { session, athletes } = card

  const isToday = isSessionToday(session.sessionStart, timezone)
  const dayLabel = isToday ? 'TODAY' : 'UPCOMING'
  const timeStr = formatSessionTime(session.sessionStart, timezone)

  return (
    <div className="bg-surface rounded-xl border border-border-subtle shadow-sm overflow-hidden"
      style={{ borderLeftWidth: 5, borderLeftColor: 'var(--color-accent)' }}
    >
      <div className="px-3.5 py-3.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-bold tracking-wide text-accent uppercase"
            style={{ letterSpacing: '0.5px' }}
          >
            {dayLabel}
          </span>
        </div>
        {athletes.map(a => (
          <div key={a.athleteId}>
            <div className="text-sm font-bold text-text-primary mb-0.5">
              {a.athleteName} is training
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
              <MapPin size={12} className="shrink-0" />
              {session.location}, {timeStr}
            </div>
            <div className="text-[13px] text-text-secondary mt-2 px-2.5 py-2 bg-accent-bg rounded-md">
              Coach: <strong className="text-text-primary">{a.coachName}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
