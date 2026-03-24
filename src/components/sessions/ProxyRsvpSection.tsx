'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { proxyRsvp } from '@/lib/sessions/rsvp-actions'

type ProxyItem = {
  id: string
  name: string
  status: string
}

type Props = {
  sessionId: string
  items: ProxyItem[]
  type: 'athletes' | 'coaches'
}

export default function ProxyRsvpSection({ sessionId, items, type }: Props) {
  const [statuses, setStatuses] = useState<Record<string, 'yes' | 'no'>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = items.filter(i => i.status === 'pending' && !statuses[i.id])
  if (pending.length === 0) return null

  const rsvpType = type === 'athletes' ? 'athlete' : 'coach'
  const positiveStatus = type === 'athletes' ? 'attending' : 'available'
  const negativeStatus = type === 'athletes' ? 'not_attending' : 'unavailable'

  async function handleProxy(targetId: string, positive: boolean) {
    setBusyId(targetId)
    setError(null)
    const status = positive ? positiveStatus : negativeStatus
    const result = await proxyRsvp(sessionId, rsvpType, targetId, status)
    setBusyId(null)
    if (result.error) {
      setError(result.error)
    } else {
      setStatuses(p => ({ ...p, [targetId]: positive ? 'yes' : 'no' }))
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[10px] border border-amber-200 dark:border-amber-800 p-3 mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock size={14} className="text-amber-600 dark:text-amber-300" />
        <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
          Awaiting Response ({pending.length} {type})
        </span>
      </div>
      <p className="text-[11px] text-amber-900 dark:text-amber-300 mb-2.5">
        {type === 'athletes'
          ? 'Coaches and admin can respond on behalf of athletes without active caregiver accounts'
          : 'Admin can respond on behalf of coaches'}
      </p>
      {pending.map(item => (
        <div
          key={item.id}
          className="flex items-center justify-between py-1.5 border-b border-amber-200/25 last:border-b-0"
        >
          <span className="text-[13px] font-semibold text-amber-800 dark:text-amber-200">{item.name}</span>
          {statuses[item.id] ? (
            <span className={`text-xs font-semibold ${statuses[item.id] === 'yes' ? 'text-accent-text' : 'text-red-600 dark:text-red-400'}`}>
              {statuses[item.id] === 'yes' ? '✓ Marked' : '✗ Marked'}
            </span>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => handleProxy(item.id, true)}
                disabled={busyId === item.id}
                className="py-1.5 px-2.5 text-[11px] font-bold rounded-md bg-accent text-white border-none cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {type === 'athletes' ? 'Attending' : 'Available'}
              </button>
              <button
                onClick={() => handleProxy(item.id, false)}
                disabled={busyId === item.id}
                className="py-1.5 px-2.5 text-[11px] font-semibold rounded-md bg-transparent text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                Not
              </button>
            </div>
          )}
        </div>
      ))}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
