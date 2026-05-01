import { useState, useMemo } from 'react'
import type { Candidate } from '../types/candidate'

interface Props {
  candidates: Candidate[]
  loading: boolean
  error: string | null
}

const CLEARANCE_OPTIONS = ['Any', 'SC', 'DV', 'NPPV2']
const AVAILABILITY_OPTIONS = ['Any', '>= 25%', '>= 50%', '>= 75%']

function meetsAvailability(candidate: Candidate, filter: string) {
  if (filter === '>= 25%') return candidate.availability >= 25
  if (filter === '>= 50%') return candidate.availability >= 50
  if (filter === '>= 75%') return candidate.availability >= 75
  return true
}

const defaultFilters = {
  location: 'Any',
  grade: 'Any',
  clearance: 'Any',
  availability: 'Any',
  role: 'Any',
  skill: 'Any',
}

const selectClass = 'px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500'

export default function ManualSearch({ candidates, loading, error }: Props) {
  const [filters, setFilters] = useState(defaultFilters)

  function setFilter(key: keyof typeof defaultFilters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function resetFilters() {
    setFilters(defaultFilters)
  }

  const dropdownOptions = useMemo(() => {
    const locations = new Set<string>()
    const grades = new Set<string>()
    const roles = new Set<string>()
    const skills = new Set<string>()

    for (const candidate of candidates) {
      if (candidate.country) locations.add(candidate.country)
      if (candidate.department) grades.add(candidate.department)
      if (candidate.latest_cv_title) roles.add(candidate.latest_cv_title)
      if (candidate.skills) {
        candidate.skills.split(',').forEach(skill => {
          const trimmed = skill.trim()
          if (trimmed) skills.add(trimmed)
        })
      }
    }

    return {
      locations: ['Any', ...Array.from(locations).sort()],
      grades: ['Any', ...Array.from(grades).sort()],
      roles: ['Any', ...Array.from(roles).sort()],
      skills: ['Any', ...Array.from(skills).sort()],
    }
  }, [candidates])

  const visibleCandidates = useMemo(() => candidates.filter(candidate =>
    (filters.location === 'Any' || candidate.country === filters.location) &&
    (filters.grade === 'Any' || candidate.department === filters.grade) &&
    (filters.clearance === 'Any' || candidate.clearance === filters.clearance) &&
    (filters.role === 'Any' || candidate.latest_cv_title === filters.role) &&
    (filters.skill === 'Any' || candidate.skills?.toLowerCase().includes(filters.skill.toLowerCase())) &&
    meetsAvailability(candidate, filters.availability)
  ), [candidates, filters])

  const filterFields = [
    { label: 'Location', key: 'location' as const, options: dropdownOptions.locations },
    { label: 'Grade', key: 'grade' as const, options: dropdownOptions.grades },
    { label: 'SC Clearance', key: 'clearance' as const, options: CLEARANCE_OPTIONS },
    { label: 'Availability', key: 'availability' as const, options: AVAILABILITY_OPTIONS },
    { label: 'Role', key: 'role' as const, options: dropdownOptions.roles },
    { label: 'Skills', key: 'skill' as const, options: dropdownOptions.skills },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🔍</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Manual Search & Filter</h2>
        <span className="text-sm text-gray-500">Filter candidates using dropdown selections</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        {filterFields.map(({ label, key, options }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
            <select
              value={filters[key]}
              onChange={event => setFilter(key, event.target.value)}
              className={selectClass}
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Candidates ({loading ? '…' : visibleCandidates.length})
        </h3>
        {loading && <p className="text-sm text-gray-500">Loading candidates...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {visibleCandidates.length > 0 && (
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
              {visibleCandidates.map(candidate => (
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

      {!loading && visibleCandidates.length === 0 && candidates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No candidates match your current filters. Try adjusting your selections.
        </div>
      )}
    </div>
  )
}
