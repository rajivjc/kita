'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { addStoryUpdate, deleteStoryUpdate } from '@/app/athletes/[id]/actions'
import { useClubConfig } from '@/components/providers/ClubConfigProvider'

export type StoryUpdateData = {
  id: string
  content: string
  created_at: string
  coach_name: string | null
  coach_user_id: string | null
}

type StoryUpdatesSectionProps = {
  athleteId: string
  updates: StoryUpdateData[]
  currentUserId?: string
  isAdmin?: boolean
}

export default function StoryUpdatesSection({
  athleteId,
  updates,
  currentUserId,
  isAdmin = false,
}: StoryUpdatesSectionProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    const trimmed = content.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    const result = await addStoryUpdate(athleteId, trimmed)
    setSaving(false)
    if (result.error) { setError(result.error); return }
    setContent('')
    router.refresh()
  }

  async function handleDelete(updateId: string) {
    setDeletingId(updateId)
    const result = await deleteStoryUpdate(updateId, athleteId)
    setDeletingId(null)
    if (result.error) { setError(result.error); return }
    router.refresh()
  }

  const { timezone, locale } = useClubConfig()

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: timezone,
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-raised rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Add story update
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a short update for the public story page…"
          rows={2}
          maxLength={500}
          className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm resize-none transition-shadow duration-200 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.08)] focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-hint">
            {content.length}/500
          </span>
          <button
            onClick={handleAdd}
            disabled={saving || !content.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:scale-[0.97] disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-all duration-150"
          >
            {saving ? 'Saving…' : 'Add update'}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📖</p>
          <p className="text-sm font-medium text-text-primary mb-1">No story updates yet</p>
          <p className="text-xs text-text-muted">
            Story updates appear on the public story page as a timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {updates.map((update) => {
            const canDelete = isAdmin || (currentUserId && update.coach_user_id === currentUserId)
            return (
              <div
                key={update.id}
                className="bg-surface rounded-xl border border-border-subtle p-4 shadow-sm"
              >
                <p className="text-sm text-text-primary">{update.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {update.coach_name && (
                      <span className="text-xs font-medium text-text-muted">
                        {update.coach_name}
                      </span>
                    )}
                    <span className="text-xs text-text-hint">
                      {formatDate(update.created_at)}
                    </span>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(update.id)}
                      disabled={deletingId === update.id}
                      className="text-xs text-text-hint hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
