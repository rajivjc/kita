'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Users, CheckCircle, X } from 'lucide-react'
import { cancelSession, completeSession } from '@/app/admin/sessions/actions'

type Props = {
  sessionId: string
  pairingsPublished: boolean
  sessionStatus: 'draft' | 'published' | 'completed' | 'cancelled'
}

export default function SessionAdminActions({ sessionId, pairingsPublished, sessionStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (sessionStatus === 'completed' || sessionStatus === 'cancelled') return null

  function handleComplete() {
    if (!window.confirm('Mark this session as complete?')) return
    setError(null)
    startTransition(async () => {
      const result = await completeSession(sessionId)
      if (result.error) setError(result.error)
    })
  }

  function handleCancel() {
    if (!window.confirm('Cancel this session? This will notify all participants.')) return
    setError(null)
    startTransition(async () => {
      const result = await cancelSession(sessionId)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="border-t border-border-subtle mt-2 pt-3">
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => router.push(`/admin/sessions/${sessionId}/edit`)}
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-[13px] font-semibold rounded-lg bg-surface text-text-secondary border border-border cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          <Edit size={14} /> Edit Session
        </button>
        <button
          onClick={() => router.push(`/admin/sessions/${sessionId}/pairings`)}
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-[13px] font-bold rounded-lg bg-accent text-white border-none cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          <Users size={14} /> {pairingsPublished ? 'Edit Pairings' : 'Assign Pairings'}
        </button>
        {sessionStatus === 'published' && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-[13px] font-semibold rounded-lg bg-surface text-text-secondary border border-border cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            <CheckCircle size={14} /> Mark Complete
          </button>
        )}
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-[13px] font-semibold rounded-lg bg-surface text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          <X size={14} /> Cancel Session
        </button>
      </div>
    </div>
  )
}
