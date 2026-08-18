import { GraduationCap } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            TA Progress Tracker
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Monitor mentee problem-solving progress
          </p>
        </div>
      </div>
    </header>
  )
}
