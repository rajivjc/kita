'use client'

import { useState } from 'react'
import { X, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'

export type PhotoData = {
  id: string
  session_id: string | null
  signed_url: string
  caption: string | null
  created_at: string
}

type PhotosTabProps = {
  photos: PhotoData[]
  athleteName: string
}

function Lightbox({ photo, onClose }: { photo: PhotoData; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={24} />
      </button>
      <div onClick={(e) => e.stopPropagation()} className="max-w-full max-h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.signed_url}
          alt={photo.caption ?? 'Session photo'}
          className="max-w-full max-h-[85vh] rounded-lg object-contain"
        />
        {(photo.caption || photo.created_at) && (
          <div className="text-center mt-3">
            {photo.caption && (
              <p className="text-sm text-white/90 mb-1">{photo.caption}</p>
            )}
            <p className="text-xs text-white/50">{formatDate(photo.created_at)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PhotosTab({ photos, athleteName }: PhotosTabProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadAll() {
    setDownloading(true)
    try {
      for (const photo of photos) {
        const res = await fetch(photo.signed_url)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${athleteName.replace(/\s+/g, '_')}_${formatDate(photo.created_at).replace(/\s+/g, '_')}_${photo.id.slice(0, 8)}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch {
      // Silently handle download failures
    }
    setDownloading(false)
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📷</p>
        <p className="text-sm font-semibold text-gray-900 mb-1">No photos yet</p>
        <p className="text-xs text-gray-500">Photos from Strava syncs and manual uploads will appear here.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Photo grid — 2 cols on mobile, 3 on wider screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.signed_url}
              alt={photo.caption ?? 'Session photo'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
              <p className="text-[10px] text-white/90 font-medium">{formatDate(photo.created_at)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Download all button */}
      {photos.length > 1 && (
        <button
          onClick={handleDownloadAll}
          disabled={downloading}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl py-3 transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {downloading ? 'Downloading…' : `Download all ${photos.length} photos`}
        </button>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}
