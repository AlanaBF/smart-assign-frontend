import axios from 'axios'
import type { CandidatesResponse } from '../types/candidate'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
})

export interface CandidateFilters {
  page?: number
  limit?: number
  country?: string
  grade?: string
  clearance?: string
  availability?: number
  role?: string
  skill?: string
}

export async function getCandidates(filters: CandidateFilters = {}): Promise<CandidatesResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )

  const { data } = await apiClient.get<CandidatesResponse>('/candidates', { params })
  return data
}
