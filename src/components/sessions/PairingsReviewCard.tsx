'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useClubConfig } from '@/components/providers/ClubConfigProvider'
import { formatSessionDate } from '@/lib/sessions/datetime'
import type { PairingsReviewCardData } from '@/lib/feed/types'

interface Props {
  card: PairingsReviewCardData
}

export default function PairingsReviewCard({ card }: Props) {
  const { timezone } = useClubConfig()
  const { session, staleDetails } = card
  const dateStr = formatSessionDate(session.sessionStart, timezone)

  return (
    <div
      className="rounded-xl shadow-sm overflow-hidden"
      style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderLeftWidth: 5,
        borderLeftColor: '#F59E0B',
      }}
    >
      <div className="px-3.5 py-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-base">&#x26A0;&#xFE0F;</span>
          <span className="text-[13px] font-bold" style={{ color: '#92400E' }}>
            Pairings need review
          </span>
        </div>
        <div className="text-xs mb-2.5" style={{ color: '#78350F', lineHeight: 1.5 }}>
          {staleDetails} Session: {dateStr}.
        </div>
        <Link
          href={`/admin/sessions/${session.id}/pairings`}
          className="inline-flex items-center gap-1 px-3.5 py-2 text-[13px] font-bold rounded-lg text-white border-none cursor-pointer min-h-[40px]"
          style={{ background: '#F59E0B' }}
        >
          Review Pairings <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
