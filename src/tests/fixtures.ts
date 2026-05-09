import type { CandidatesResponse } from '../types/candidate'

export const mockCandidate = {
  user_id: 1,
  full_name: 'Test User',
  email: null,
  department: 'CPD3L',
  country: 'Ireland',
  latest_cv_title: 'Developer',
  skills: 'Python, React',
  availability: 75,
  clearance: 'SC',
  years_experience: 5,
}

export const mockCandidatesResponse: CandidatesResponse = {
  candidates: [mockCandidate],
  total: 1,
  page: 1,
  limit: 25,
}

export const mockEmptyResponse: CandidatesResponse = {
  candidates: [],
  total: 0,
  page: 1,
  limit: 25,
}

export const mockPaginatedResponse: CandidatesResponse = {
  candidates: Array.from({ length: 25 }, (_, i) => ({
    ...mockCandidate,
    user_id: i + 1,
    full_name: `User ${i + 1}`,
    country: 'UK',
    latest_cv_title: 'Engineer',
    skills: 'Java',
    availability: 50,
    years_experience: 3,
  })),
  total: 50,
  page: 1,
  limit: 25,
}
