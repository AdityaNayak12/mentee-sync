import { AlertTriangle } from 'lucide-react'

interface SyncWarningBadgeProps {
  compact?: boolean
}

export function SyncWarningBadge({ compact = false }: SyncWarningBadgeProps) {
  if (compact) {
    return (
      <span
        className="inline-flex items-center text-amber-600"
        title="Last sync was over 24 hours ago — mentee may need to log back in"
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Sync may be stale</span>
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200"
      title="Last sync was over 24 hours ago — mentee may need to log back in"
    >
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      Stale sync
    </span>
  )
}
