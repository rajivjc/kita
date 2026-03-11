'use client'

import { useState } from 'react'
import { QrCode, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  athleteId: string
  athleteName: string
}

export default function AthleteQrCode({ athleteId, athleteName }: Props) {
  const [open, setOpen] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/my/${athleteId}`
    : `/my/${athleteId}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
        aria-label="Show QR code for athlete page"
        title="Athlete QR code"
      >
        <QrCode size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {athleteName}&apos;s page
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <QRCodeSVG
                  value={url}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Scan this code to open {athleteName}&apos;s running page.
              They will need their PIN to sign in.
            </p>

            <button
              onClick={() => window.print()}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Print QR code
            </button>
          </div>
        </div>
      )}
    </>
  )
}
