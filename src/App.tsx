import { useEffect, useState } from 'react'
import ManualSearch from './components/ManualSearch'
import { getAllCandidates } from './services/api'
import type { Candidate } from './types/candidate'

export default function App() {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])
  const [allCandidatesLoading, setAllCandidatesLoading] = useState(true)
  const [allCandidatesError, setAllCandidatesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAllCandidates()
      .then(candidates => { if (!cancelled) setAllCandidates(candidates) })
      .catch(error => { if (!cancelled) setAllCandidatesError(error instanceof Error ? error.message : 'Failed to load candidates') })
      .finally(() => { if (!cancelled) setAllCandidatesLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-teal-500">
      <header className="bg-slate-800 text-white px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <img
              src="/smart-assign-logo.png"
              alt="SmartAssign"
              className="h-12 w-12 rounded-lg"
            />
            <h1 className="text-xl font-bold">SmartAssign</h1>
          </div>
          <button aria-label="Open chat" className="opacity-80 hover:opacity-100 transition-opacity">
            <img src="/chat-icon.png" alt="Chat" className="h-12 w-12" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <ManualSearch
          candidates={allCandidates}
          loading={allCandidatesLoading}
          error={allCandidatesError}
        />
      </div>
    </div>
  )
}
