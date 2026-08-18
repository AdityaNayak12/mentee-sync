import { ChevronRight, Search, Users } from 'lucide-react'
import type { Mentee } from '../types/mentee'
import {
  calculateAveragePercentage,
  formatLastSynced,
  getProgressColor,
  isSyncStale,
} from '../utils/menteeUtils'
import { SyncWarningBadge } from './SyncWarningBadge'

interface MenteeTableProps {
  mentees: Mentee[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onMenteeSelect: (mentee: Mentee) => void
}

export function MenteeTable({
  mentees,
  searchQuery,
  onSearchChange,
  onMenteeSelect,
}: MenteeTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mentees</h2>
            <p className="text-sm text-slate-500">
              Click a row to view subject-level progress
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              aria-label="Search mentees"
            />
          </div>
        </div>
      </div>

      {mentees.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No mentees found</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {searchQuery
              ? `No results match "${searchQuery}". Try a different name or email.`
              : 'No mentees are being tracked yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Avg. Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Last Synced
                </th>
                <th className="px-4 py-3 sm:px-6">
                  <span className="sr-only">View details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mentees.map((mentee) => {
                const average = calculateAveragePercentage(mentee)
                const colors = getProgressColor(average)
                const stale = isSyncStale(mentee.timestamp)

                return (
                  <tr
                    key={mentee.email}
                    onClick={() => onMenteeSelect(mentee)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onMenteeSelect(mentee)
                      }
                    }}
                    tabIndex={0}
                    className="cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    aria-label={`View details for ${mentee.name}`}
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900 sm:px-6">
                      {mentee.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 sm:px-6">
                      {mentee.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colors.badge}`}
                      >
                        {average.toFixed(1)}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 sm:px-6">
                      <span className="inline-flex items-center gap-2">
                        {formatLastSynced(mentee.timestamp)}
                        {stale && <SyncWarningBadge compact />}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-400 sm:px-6">
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
