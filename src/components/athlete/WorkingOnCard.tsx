'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { updateWorkingOn } from '@/app/athletes/[id]/actions'
import { formatDate } from '@/lib/utils/dates'

interface Props {
  athleteId: string
  athleteName: string
  workingOn: string | null
  recentProgress: string | null
  updatedAt: string | null
  updatedByName: string | null
  isReadOnly: boolean
}

export default function WorkingOnCard({
  athleteId,
  athleteName,
  workingOn,
  recentProgress,
  updatedAt,
  updatedByName,
  isReadOnly,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [workingOnDraft, setWorkingOnDraft] = useState(workingOn ?? '')
  const [progressDraft, setProgressDraft] = useState(recentProgress ?? '')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const firstName = athleteName.split(' ')[0]

  function handleSave() {
    startTransition(async () => {
      const result = await updateWorkingOn(athleteId, workingOnDraft, progressDraft)
      if (!result.error) {
        setEditing(false)
        router.refresh()
      }
    })
  }

  function handleCancel() {
    setWorkingOnDraft(workingOn ?? '')
    setProgressDraft(recentProgress ?? '')
    setEditing(false)
  }

  // Empty state — prompt coach to add
  if (!workingOn && !editing) {
    if (isReadOnly) return null
    return (
      <div className="mb-6 bg-surface-raised border border-dashed border-border rounded-xl px-4 py-4">
        <p className="text-sm font-medium text-text-secondary mb-1">
          What is {firstName} working on right now?
        </p>
        <p className="text-xs text-text-muted mb-3">
          Add a short status to help caregivers understand what stage {firstName} is at.
        </p>
        <button
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          Add status
        </button>
      </div>
    )
  }

  // Edit mode
  if (editing) {
    return (
      <div className="mb-6 bg-surface border border-teal-200 rounded-xl px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">Working on</p>
          <button
            onClick={handleCancel}
            className="p-1 text-text-hint hover:text-text-secondary transition-colors"
            aria-label="Cancel editing"
          >
            <X size={16} />
          </button>
        </div>
        <label className="block text-sm text-text-secondary mb-1">
          What is {firstName} working on right now?
        </label>
        <textarea
          value={workingOnDraft}
          onChange={e => setWorkingOnDraft(e.target.value)}
          placeholder="e.g. Walk-run intervals, building to 2 min running / 1 min walking"
          rows={2}
          maxLength={300}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 resize-none mb-3"
        />
        <label className="block text-sm text-text-secondary mb-1">
          Recent progress (optional)
        </label>
        <textarea
          value={progressDraft}
          onChange={e => setProgressDraft(e.target.value)}
          placeholder="e.g. Can now run for 90 seconds without stopping"
          rows={2}
          maxLength={300}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 resize-none mb-2"
        />
        <p className="text-[10px] text-text-hint mb-3">
          Visible to {firstName}&apos;s caregiver.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleCancel}
            className="text-sm text-text-muted hover:text-text-secondary px-3 py-1.5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !workingOnDraft.trim()}
            className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-4 py-1.5 rounded-lg transition-colors"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  // Display mode
  return (
    <div className="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-bold text-teal-700 uppercase tracking-widest">Working on</p>
        {!isReadOnly && (
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-teal-400 hover:text-teal-600 transition-colors"
            aria-label="Edit working on status"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      <p className="text-sm text-text-primary">{workingOn}</p>
      {recentProgress && (
        <div className="mt-2">
          <p className="text-[11px] font-semibold text-teal-600 mb-0.5">Recent progress</p>
          <p className="text-sm text-text-secondary">{recentProgress}</p>
        </div>
      )}
      {updatedAt && (
        <p className="text-[10px] text-teal-500 mt-2">
          {updatedByName ? `Updated by ${updatedByName}` : 'Updated'} · {formatDate(updatedAt)}
        </p>
      )}
    </div>
  )
}
