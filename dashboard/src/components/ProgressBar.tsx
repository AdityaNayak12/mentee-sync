import { getProgressColor } from '../utils/menteeUtils'

interface ProgressBarProps {
  percentage: number
  showLabel?: boolean
}

export function ProgressBar({ percentage, showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100)
  const colors = getProgressColor(clamped)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={`font-medium ${colors.text}`}>{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
