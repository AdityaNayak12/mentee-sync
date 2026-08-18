import type { Mentee } from '../types/mentee'

export function calculateAveragePercentage(mentee: Mentee): number {
  if (mentee.stats.length === 0) return 0
  const sum = mentee.stats.reduce((acc, stat) => acc + stat.percentage, 0)
  return Math.round((sum / mentee.stats.length) * 10) / 10
}

export function isSyncStale(timestamp: string, hoursThreshold = 24): boolean {
  const syncedAt = new Date(timestamp).getTime()
  const thresholdMs = hoursThreshold * 60 * 60 * 1000
  return Date.now() - syncedAt > thresholdMs
}

export function formatLastSynced(timestamp: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

export function getProgressColor(percentage: number): {
  bar: string
  text: string
  badge: string
} {
  if (percentage > 75) {
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    }
  }
  if (percentage >= 50) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    }
  }
  return {
    bar: 'bg-red-500',
    text: 'text-red-700',
    badge: 'bg-red-50 text-red-700 ring-red-200',
  }
}
