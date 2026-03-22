'use client'

import { useTheme } from '@/components/theme/ThemeProvider'

const OPTIONS = [
  { value: 'system' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-1 bg-surface-alt rounded-lg p-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all ${
            theme === opt.value
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
