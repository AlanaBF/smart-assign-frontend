import axios from 'axios'
import type { Candidate } from '../types/candidate'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
})

export async function getAllCandidates(): Promise<Candidate[]> {
  const { data } = await apiClient.get<Candidate[]>('/all-candidates')
  return data
}
