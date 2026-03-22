'use client'

import { useState, useEffect } from 'react'
import { X, Activity, TrendingUp, MessageCircle } from 'lucide-react'
import { HINT_KEYS } from '@/lib/hint-keys'

export default function AppContextCard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(HINT_KEYS.CONTEXT_CARD)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(HINT_KEYS.CONTEXT_CARD, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-400/60 rounded-2xl px-5 py-4 mb-3 shadow-sm">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
        aria-label="Dismiss welcome card"
      >
        <X size={16} />
      </button>

      <h2 className="text-lg font-bold text-text-primary">Your coaching hub</h2>
      <p className="text-sm text-teal-700 dark:text-teal-300 mb-3">Everything you need to support your athletes</p>

      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-teal-500 flex-shrink-0" />
          <span className="text-sm text-text-secondary">Log runs and track every session</span>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-teal-500 flex-shrink-0" />
          <span className="text-sm text-text-secondary">See progress, milestones, and mood trends</span>
        </div>
        <div className="flex items-center gap-3">
          <MessageCircle size={20} className="text-teal-500 flex-shrink-0" />
          <span className="text-sm text-text-secondary">Coordinate with coaches and caregivers</span>
        </div>
      </div>
    </div>
  )
}
