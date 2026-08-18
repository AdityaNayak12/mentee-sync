import type { MenteeStat } from '../types/mentee'
import { getProgressColor } from '../utils/menteeUtils'
import { ProgressBar } from './ProgressBar'

interface SubjectCardProps {
  stat: MenteeStat
}

export function SubjectCard({ stat }: SubjectCardProps) {
  const colors = getProgressColor(stat.percentage)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900">{stat.subject}</h4>
          <p className="mt-1 text-xs text-slate-500">{stat.program}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colors.badge}`}
        >
          {stat.percentage.toFixed(1)}%
        </span>
      </div>

      <p className="mb-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{stat.solved}</span>
        <span className="text-slate-400"> / </span>
        <span>{stat.total} solved</span>
      </p>

      <ProgressBar percentage={stat.percentage} showLabel={false} />
    </div>
  )
}
