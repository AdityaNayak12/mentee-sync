import { Users } from 'lucide-react'

interface SummaryCardProps {
  totalMentees: number
}

export function SummaryCard({ totalMentees }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Total Mentees</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {totalMentees}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Currently being tracked across all programs
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Users className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
