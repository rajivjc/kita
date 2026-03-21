'use client'

import { useState, useEffect, useRef } from 'react'
import { Download } from 'lucide-react'
import { getExportData } from '@/lib/export'
import { formatSessionsAsCSV, triggerDownload } from '@/lib/csv'

export default function ExportButton({ athleteId }: { athleteId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleCSV() {
    setLoading(true)
    try {
      const result = await getExportData(athleteId)
      if ('error' in result) {
        alert(result.error)
        return
      }
      const csv = formatSessionsAsCSV(result.data)
      const filename = result.athleteName
        .toLowerCase()
        .replace(/\s+/g, '-') + '-sessions.csv'
      triggerDownload(csv, filename)
    } catch {
      alert('Export failed. Please try again.')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
        style={{ minHeight: '44px' }}
        aria-label="Export data"
      >
        <Download size={16} />
        Export
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <button
            onClick={handleCSV}
            disabled={loading}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-t-lg transition-colors"
            style={{ minHeight: '44px' }}
          >
            {loading ? 'Downloading...' : 'Download CSV'}
          </button>
          <button
            disabled
            className="w-full text-left px-4 py-3 text-sm text-gray-400 opacity-50 cursor-not-allowed rounded-b-lg"
            style={{ minHeight: '44px' }}
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  )
}
