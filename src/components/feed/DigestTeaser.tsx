'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useClubConfig } from '@/components/providers/ClubConfigProvider'

interface DigestTeaserProps {
  /** One-line teaser text, e.g. "Wei Jie hit a new personal best this week" */
  teaserText: string
  weekLabel: string
}

export default function DigestTeaser({ teaserText, weekLabel }: DigestTeaserProps) {
  const { timezone } = useClubConfig()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show Sunday (0) through Tuesday (2) in club timezone
    const now = new Date()
    const tzDay = new Date(now.toLocaleString('en-US', { timeZone: timezone })).getDay()
    setVisible(tzDay === 0 || tzDay === 1 || tzDay === 2)
  }, [timezone])

  if (!visible) return null

  return (
    <Link href="/digest" className="block mb-5">
      <div className="bg-surface border border-border-subtle rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2">
          <span className="text-base flex-shrink-0">📋</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-hint uppercase tracking-wide mb-0.5">
              Weekly notes · {weekLabel}
            </p>
            <p className="text-sm text-text-secondary truncate">{teaserText}</p>
          </div>
          <span className="text-text-hint text-sm flex-shrink-0">&rsaquo;</span>
        </div>
      </div>
    </Link>
  )
}
