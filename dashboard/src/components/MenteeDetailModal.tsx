import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Mentee } from '../types/mentee'
import {
  calculateAveragePercentage,
  formatLastSynced,
  isSyncStale,
} from '../utils/menteeUtils'
import { SubjectCard } from './SubjectCard'
import { SyncWarningBadge } from './SyncWarningBadge'

interface MenteeDetailModalProps {
  mentee: Mentee | null
  onClose: () => void
}

export function MenteeDetailModal({ mentee, onClose }: MenteeDetailModalProps) {
  useEffect(() => {
    if (!mentee) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mentee, onClose])

  if (!mentee) return null

  const average = calculateAveragePercentage(mentee)
  const stale = isSyncStale(mentee.timestamp)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentee-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Close detail view"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="mentee-detail-title" className="text-xl font-semibold text-slate-900">
              {mentee.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{mentee.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                Overall: {average.toFixed(1)}%
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                Last synced: {formatLastSynced(mentee.timestamp)}
                {stale && <SyncWarningBadge compact />}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {mentee.stats.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No subject progress recorded for this mentee yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {mentee.stats.map((stat) => (
                <SubjectCard
                  key={`${stat.program}-${stat.subject}`}
                  stat={stat}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
