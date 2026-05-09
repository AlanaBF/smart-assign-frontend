import axios from 'axios'
import type { CandidatesResponse } from '../types/candidate'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

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
  const params: Record<string, string | number> = {}

  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.country) params.country = filters.country
  if (filters.grade) params.grade = filters.grade
  if (filters.clearance) params.clearance = filters.clearance
  if (filters.availability !== undefined) params.availability = filters.availability
  if (filters.role) params.role = filters.role
  if (filters.skill) params.skill = filters.skill

  const { data } = await apiClient.get<CandidatesResponse>('/candidates', { params })
  return data
}
