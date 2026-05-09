export interface Candidate {
  user_id: number | string
  full_name: string
  email: string | null
  department: string
  country: string | null
  latest_cv_title: string | null
  skills: string | null
  availability: number
  clearance: string | null
  years_experience: number | null
}

export interface CandidatesResponse {
  candidates: Candidate[]
  total: number
  page: number
  limit: number
}
