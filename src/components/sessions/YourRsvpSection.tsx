'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { coachRsvp, caregiverAthleteRsvp } from '@/lib/sessions/rsvp-actions'

type CoachRsvpProps = {
  type: 'coach'
  sessionId: string
  status: 'pending' | 'available' | 'unavailable'
}

type CaregiverRsvpProps = {
  type: 'caregiver'
  sessionId: string
  athletes: { athlete_id: string; name: string; status: string }[]
}

type Props = CoachRsvpProps | CaregiverRsvpProps

function CoachRsvp({ sessionId, status }: { sessionId: string; status: string }) {
  const [optimisticStatus, setOptimisticStatus] = useState(status)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRsvp(newStatus: 'available' | 'unavailable') {
    const prev = optimisticStatus
    setOptimisticStatus(newStatus)
    setError(null)
    startTransition(async () => {
      const result = await coachRsvp(sessionId, newStatus)
      if (result.error) {
        setOptimisticStatus(prev)
        setError(result.error)
      }
    })
  }

  if (optimisticStatus === 'pending') {
    return (
      <div className="bg-accent-bg rounded-[10px] border border-accent-border p-3 mb-4">
        <p className="text-xs font-semibold text-text-muted mb-2">YOUR RSVP</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleRsvp('available')}
            disabled={isPending}
            className="flex-1 py-2.5 px-3 text-[13px] font-bold rounded-lg bg-accent text-white border-none cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            Available
          </button>
          <button
            onClick={() => handleRsvp('unavailable')}
            disabled={isPending}
            className="flex-1 py-2.5 px-3 text-[13px] font-semibold rounded-lg bg-surface text-text-secondary border border-border cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            Not Available
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-accent-bg rounded-[10px] border border-accent-border px-3.5 py-2.5 mb-4">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-text-muted">YOUR RSVP:</span>
        {optimisticStatus === 'available' ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-accent-text">
            <CheckCircle size={15} /> Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-red-600 dark:text-red-400">
            <XCircle size={15} /> Not Available
          </span>
        )}
      </div>
      <button
        onClick={() => handleRsvp(optimisticStatus === 'available' ? 'unavailable' : 'available')}
        disabled={isPending}
        className="text-xs font-semibold text-accent-text bg-transparent border-none cursor-pointer disabled:opacity-50 min-h-[44px] px-2"
      >
        Change
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function CaregiverRsvp({ sessionId, athletes }: { sessionId: string; athletes: { athlete_id: string; name: string; status: string }[] }) {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(athletes.map(a => [a.athlete_id, a.status]))
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleRsvp(athleteId: string, newStatus: 'attending' | 'not_attending') {
    const prev = statuses[athleteId]
    setStatuses(s => ({ ...s, [athleteId]: newStatus }))
    setError(null)
    setPendingId(athleteId)

    caregiverAthleteRsvp(sessionId, athleteId, newStatus).then(result => {
      setPendingId(null)
      if (result.error) {
        setStatuses(s => ({ ...s, [athleteId]: prev }))
        setError(result.error)
      }
    })
  }

  return (
    <div className="bg-accent-bg rounded-[10px] border border-accent-border p-3 mb-4">
      {athletes.map(a => {
        const st = statuses[a.athlete_id]
        const isPending = st === 'pending'
        const isAttending = st === 'attending'

        return (
          <div key={a.athlete_id} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-text-primary">{a.name}:</span>
              {isAttending ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text">
                  <CheckCircle size={14} /> Attending
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                  <Clock size={14} /> Not yet responded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  <XCircle size={14} /> Not attending
                </span>
              )}
            </div>
            {isPending ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleRsvp(a.athlete_id, 'attending')}
                  disabled={pendingId === a.athlete_id}
                  className="py-1.5 px-2.5 text-[11px] font-bold rounded-md bg-accent text-white border-none cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  Attending
                </button>
                <button
                  onClick={() => handleRsvp(a.athlete_id, 'not_attending')}
                  disabled={pendingId === a.athlete_id}
                  className="py-1.5 px-2.5 text-[11px] font-semibold rounded-md bg-transparent text-text-secondary border border-border cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  Not
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleRsvp(a.athlete_id, isAttending ? 'not_attending' : 'attending')}
                disabled={pendingId === a.athlete_id}
                className="text-xs font-semibold text-accent-text bg-transparent border-none cursor-pointer disabled:opacity-50 min-h-[44px] px-2"
              >
                Change
              </button>
            )}
          </div>
        )
      })}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}

export default function YourRsvpSection(props: Props) {
  if (props.type === 'coach') {
    return <CoachRsvp sessionId={props.sessionId} status={props.status} />
  }
  return <CaregiverRsvp sessionId={props.sessionId} athletes={props.athletes} />
}
