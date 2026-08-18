import { Puzzle } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Puzzle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">No mentees synced yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Once your mentees install the sync extension and log into Scaler, their
        progress will appear here automatically.
      </p>
      <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-slate-600">
        <li className="flex gap-2">
          <span className="font-semibold text-slate-900">1.</span>
          Ask mentees to install the Mentee Sync browser extension
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-slate-900">2.</span>
          Have them log in with their @sst.scaler.com account
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-slate-900">3.</span>
          Click &quot;Sync Now&quot; or wait for the hourly auto-sync
        </li>
      </ol>
    </div>
  )
}
