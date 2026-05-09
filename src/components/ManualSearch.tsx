import { useState, useEffect, useCallback } from 'react'
import type { Candidate } from '../types/candidate'
import { getCandidates, type CandidateFilters } from '../services/api'

const CLEARANCE_OPTIONS = ['Any', 'SC', 'DV', 'NPPV2', 'None']
const AVAILABILITY_OPTIONS = ['Any', '>= 25%', '>= 50%', '>= 75%']
const COUNTRY_OPTIONS = ['Any', 'Australia', 'Ireland', 'Spain', 'UK', 'USA']
const PAGE_SIZE = 25

const defaultFilters = {
  country: 'Any',
  grade: 'Any',
  clearance: 'Any',
  availability: 'Any',
  role: '',
  skill: '',
}

const selectClass = 'px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500'

export default function ManualSearch() {
  const [filters, setFilters] = useState(defaultFilters)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCandidates = useCallback(async (currentFilters: typeof defaultFilters, currentPage: number) => {
    setLoading(true)
    setError(null)

    const params: CandidateFilters = {
      page: currentPage,
      limit: PAGE_SIZE,
    }

    if (currentFilters.country !== 'Any') params.country = currentFilters.country
    if (currentFilters.grade !== 'Any') params.grade = currentFilters.grade
    if (currentFilters.clearance !== 'Any') params.clearance = currentFilters.clearance
    if (currentFilters.availability !== 'Any') {
      const match = currentFilters.availability.match(/\d+/)
      if (match) params.availability = parseInt(match[0])
    }
    if (currentFilters.role) params.role = currentFilters.role
    if (currentFilters.skill) params.skill = currentFilters.skill

    try {
      const response = await getCandidates(params)
      setCandidates(response.candidates)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates(filters, page)
  }, [filters, page, fetchCandidates])

  function setFilter(key: keyof typeof defaultFilters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function resetFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const filterFields = [
    { label: 'Location', key: 'country' as const, type: 'select' as const, options: COUNTRY_OPTIONS },
    { label: 'Grade', key: 'grade' as const, type: 'select' as const, options: ['Any', 'CPD3E', 'CPD3L', 'CPD4E', 'CPD4L', 'CPD5'] },
    { label: 'SC Clearance', key: 'clearance' as const, type: 'select' as const, options: CLEARANCE_OPTIONS },
    { label: 'Availability', key: 'availability' as const, type: 'select' as const, options: AVAILABILITY_OPTIONS },
    { label: 'Role', key: 'role' as const, type: 'text' as const, options: [] },
    { label: 'Skills', key: 'skill' as const, type: 'text' as const, options: [] },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">&#128269;</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Manual Search & Filter</h2>
        <span className="text-sm text-gray-500">Filter candidates using dropdown selections</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        {filterFields.map(({ label, key, type, options }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
            {type === 'select' ? (
              <select
                value={filters[key]}
                onChange={event => setFilter(key, event.target.value)}
                className={selectClass}
              >
                {options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={filters[key]}
                onChange={event => setFilter(key, event.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className={selectClass}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          Reset filters
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Candidates ({loading ? '...' : total})
          </h3>
          {loading && <p className="text-sm text-gray-500">Loading candidates...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {candidates.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['Name', 'Location', 'Grade', 'Role', 'SC Clearance', 'Availability', 'Key Skills'].map(heading => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {candidates.map(candidate => (
                <tr key={candidate.user_id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{candidate.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.country}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.latest_cv_title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {candidate.clearance || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.availability}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{candidate.skills}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No candidates match your current filters. Try adjusting your selections.
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
