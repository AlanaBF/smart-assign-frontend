import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCandidates, apiClient } from '../services/api'

describe('api service - getCandidates', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls the correct endpoint /candidates', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { candidates: [], total: 0, page: 1, limit: 25 },
    })

    await getCandidates({ page: 1, limit: 25 })

    expect(getSpy).toHaveBeenCalledWith('/candidates', {
      params: { page: 1, limit: 25 },
    })
  })

  it('passes filter params correctly', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { candidates: [], total: 0, page: 1, limit: 25 },
    })

    await getCandidates({
      page: 1,
      limit: 25,
      country: 'UK',
      grade: 'CPD3L',
      clearance: 'SC',
      availability: 50,
      role: 'Engineer',
      skill: 'Python',
    })

    expect(getSpy).toHaveBeenCalledWith('/candidates', {
      params: {
        page: 1,
        limit: 25,
        country: 'UK',
        grade: 'CPD3L',
        clearance: 'SC',
        availability: 50,
        role: 'Engineer',
        skill: 'Python',
      },
    })
  })

  it('does not send empty/undefined filters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { candidates: [], total: 0, page: 1, limit: 25 },
    })

    await getCandidates({})

    expect(getSpy).toHaveBeenCalledWith('/candidates', {
      params: {},
    })
  })

  it('returns the response data', async () => {
    const mockResponse = {
      candidates: [
        {
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
        },
      ],
      total: 1,
      page: 1,
      limit: 25,
    }

    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: mockResponse })

    const result = await getCandidates({ page: 1, limit: 25 })

    expect(result).toEqual(mockResponse)
  })

  it('only sends non-falsy filters (empty strings are excluded)', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { candidates: [], total: 0, page: 1, limit: 25 },
    })

    await getCandidates({
      page: 1,
      limit: 25,
      country: undefined,
      grade: '',
      role: '',
      skill: '',
    })

    // grade, role, skill are empty strings (falsy) and should not appear
    // country is undefined and should not appear
    expect(getSpy).toHaveBeenCalledWith('/candidates', {
      params: { page: 1, limit: 25 },
    })
  })
})
