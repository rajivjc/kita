'use client'

import { useClubConfig } from '@/components/providers/ClubConfigProvider'
import { formatSessionTime, formatSessionTimeRange, isSessionToday } from '@/lib/sessions/datetime'
import type { AssignmentCardData } from '@/lib/feed/types'

interface Props {
  card: AssignmentCardData
}

export default function AssignmentCard({ card }: Props) {
  const { timezone } = useClubConfig()
  const { session, athletes } = card

  const isToday = isSessionToday(session.sessionStart, timezone)
  const dayLabel = isToday ? 'TODAY' : 'TOMORROW'
  const timeRange = formatSessionTimeRange(session.sessionStart, session.sessionEnd, timezone)

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
        <div className="text-sm font-bold text-text-primary mb-0.5">
          {session.title ?? 'Training'} at {session.location}
        </div>
        <div className="text-xs text-text-muted mb-3.5">{timeRange}</div>

        <div className="text-xs font-semibold text-text-muted uppercase mb-2"
          style={{ letterSpacing: '0.5px' }}
        >
          Your athletes
        </div>

        <div className="flex flex-col gap-2 mb-3.5">
          {athletes.map(a => (
            <div
              key={a.id}
              className="flex items-start gap-2.5 bg-accent-bg rounded-lg px-3 py-2.5"
            >
              <span className="text-lg leading-none">{a.avatar ?? '🏃'}</span>
              <div>
                <div className="text-sm font-bold text-text-primary">{a.name}</div>
                {a.cues && (
                  <div className="text-xs text-text-secondary mt-0.5">
                    Cues: &ldquo;{a.cues}&rdquo;
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          disabled
          className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-bold rounded-lg bg-accent text-white border-none min-h-[44px] opacity-60 cursor-not-allowed"
        >
          Log Runs
        </button>
      </div>
    </div>
  )
}
