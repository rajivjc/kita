'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'

type RsvpItem = {
  id: string
  name: string
  status: string
}

type Props = {
  title: string
  items: RsvpItem[]
  positiveLabel: string
  positiveStatus: string
}

function StatusIcon({ status, positiveStatus }: { status: string; positiveStatus: string }) {
  if (status === positiveStatus) return <CheckCircle size={14} className="text-accent-text shrink-0" />
  if (status === 'pending') return <Clock size={14} className="text-amber-600 dark:text-amber-300 shrink-0" />
  return <XCircle size={14} className="text-red-600 dark:text-red-400 shrink-0" />
}

function sortItems(items: RsvpItem[], positiveStatus: string): RsvpItem[] {
  const order: Record<string, number> = { [positiveStatus]: 0, pending: 1 }
  return [...items].sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2))
}

export default function RsvpStatusList({ title, items, positiveLabel, positiveStatus }: Props) {
  const [expanded, setExpanded] = useState(false)

  const positiveCount = items.filter(i => i.status === positiveStatus).length
  const pendingCount = items.filter(i => i.status === 'pending').length

  const sorted = sortItems(items, positiveStatus)
  const showing = expanded ? sorted : sorted.slice(0, 6)

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
          {title}
        </span>
        <span className="text-[11px] text-text-hint">
          {positiveCount} {positiveLabel}{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
        </span>
      </div>
      <div
        className="grid grid-cols-2 gap-px bg-border-subtle rounded-lg overflow-hidden"
      >
        {showing.map(item => {
          const isNegative = item.status !== positiveStatus && item.status !== 'pending'
          const isPending = item.status === 'pending'
          return (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-surface text-[13px]"
            >
              <StatusIcon status={item.status} positiveStatus={positiveStatus} />
              <span
                className={`font-medium overflow-hidden text-ellipsis whitespace-nowrap ${
                  isNegative ? 'text-text-hint line-through' :
                  isPending ? 'text-text-hint' :
                  'text-text-primary'
                }`}
              >
                {item.name}
              </span>
            </div>
          )
        })}
      </div>
      {items.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full py-2 mt-1 text-xs font-semibold text-accent-text bg-transparent border-none cursor-pointer"
        >
          {expanded ? (
            <>Show less <ChevronUp size={14} /></>
          ) : (
            <>Show all {items.length} <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}
