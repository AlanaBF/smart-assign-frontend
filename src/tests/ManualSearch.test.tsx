import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import ManualSearch from '../components/ManualSearch'
import { getCandidates } from '../services/api'

vi.mock('../services/api')

const mockCandidatesResponse = {
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

const mockEmptyResponse = {
  candidates: [],
  total: 0,
  page: 1,
  limit: 25,
}

const mockPaginatedResponse = {
  candidates: Array.from({ length: 25 }, (_, i) => ({
    user_id: i + 1,
    full_name: `User ${i + 1}`,
    email: null,
    department: 'CPD3L',
    country: 'UK',
    latest_cv_title: 'Engineer',
    skills: 'Java',
    availability: 50,
    clearance: 'SC',
    years_experience: 3,
  })),
  total: 50,
  page: 1,
  limit: 25,
}

/** Helper to find a select/input by its associated label text in the filter section */
function getFilterField(labelText: string): HTMLElement {
  const labels = screen.getAllByText(labelText)
  // Find the label that is inside the filter grid (has class uppercase tracking-wide)
  const filterLabel = labels.find(el =>
    el.classList.contains('uppercase') && el.classList.contains('tracking-wide')
  ) || labels[0]
  const container = filterLabel.closest('div')!
  const select = container.querySelector('select')
  if (select) return select
  const input = container.querySelector('input')
  if (input) return input
  throw new Error(`No select or input found for label "${labelText}"`)
}

describe('ManualSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(getCandidates).mockReturnValue(new Promise(() => {}))
    render(<ManualSearch />)
    expect(screen.getByText('Loading candidates...')).toBeInTheDocument()
    expect(screen.getByText('Candidates (...)')).toBeInTheDocument()
  })

  it('displays candidates after loading', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    // Check table content exists - use getAllByText for values that also appear in filter options
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Python, React')).toBeInTheDocument()
    expect(screen.getByText('Candidates (1)')).toBeInTheDocument()
  })

  it('renders all filter dropdowns (Location, Grade, Clearance, Availability, Role, Skills)', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    // Filter labels are uppercase/tracking-wide labels
    const filterLabels = ['Location', 'Grade', 'SC Clearance', 'Availability', 'Role', 'Skills']
    for (const label of filterLabels) {
      const elements = screen.getAllByText(label)
      // At least one should be a filter label
      const hasFilterLabel = elements.some(el =>
        el.classList.contains('uppercase') && el.classList.contains('tracking-wide')
      )
      expect(hasFilterLabel).toBe(true)
    }
  })

  it('triggers a new API call when a filter is changed', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    // Initial call
    expect(getCandidates).toHaveBeenCalledTimes(1)

    // Change the Location filter
    const locationSelect = getFilterField('Location')
    await user.selectOptions(locationSelect, 'UK')

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledTimes(2)
    })

    expect(getCandidates).toHaveBeenLastCalledWith(
      expect.objectContaining({ country: 'UK', page: 1, limit: 25 })
    )
  })

  it('resets filters when the Reset filters button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    // Change a filter first
    const locationSelect = getFilterField('Location')
    await user.selectOptions(locationSelect, 'Ireland')

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ country: 'Ireland' })
      )
    })

    // Now reset
    const resetButton = screen.getByRole('button', { name: 'Reset filters' })
    await user.click(resetButton)

    await waitFor(() => {
      // After reset, should be called without country filter
      const lastCall = vi.mocked(getCandidates).mock.calls.at(-1)?.[0]
      expect(lastCall).not.toHaveProperty('country')
    })
  })

  it('shows pagination controls when total > 25', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    expect(screen.getAllByRole('button', { name: 'Previous' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Next' }).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Page 1 of 2').length).toBeGreaterThan(0)
  })

  it('calls API with page=2 when clicking Next', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    // Click one of the Next buttons
    const nextButtons = screen.getAllByRole('button', { name: 'Next' })
    await user.click(nextButtons[0])

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 25 })
      )
    })
  })

  it('displays an error message when the API call fails', async () => {
    vi.mocked(getCandidates).mockRejectedValue(new Error('Network error'))
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows "No candidates match" message when no results are returned', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockEmptyResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(
        screen.getByText('No candidates match your current filters. Try adjusting your selections.')
      ).toBeInTheDocument()
    })
  })

  it('does not show pagination when total <= 25', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('sends availability filter as a number when selected', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    const availabilitySelect = getFilterField('Availability')
    await user.selectOptions(availabilitySelect, '>= 50%')

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ availability: 50 })
      )
    })
  })

  it('sends text input filters (role, skill) to the API', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    const roleInput = screen.getByPlaceholderText('Search role...')
    await user.type(roleInput, 'Engineer')

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'Engineer' })
      )
    })
  })

  it('calls API with page=1 when clicking Previous from page 2', async () => {
    const user = userEvent.setup()
    // First render with paginated data on page 1
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    // Go to page 2 first
    const nextButtons = screen.getAllByRole('button', { name: 'Next' })
    await user.click(nextButtons[0])

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })

    // Now click Previous
    vi.mocked(getCandidates).mockResolvedValue({
      ...mockPaginatedResponse,
      page: 2,
    })

    const prevButtons = screen.getAllByRole('button', { name: 'Previous' })
    await user.click(prevButtons[0])

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      )
    })
  })

  it('disables Previous button on first page', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
    })

    const prevButtons = screen.getAllByRole('button', { name: 'Previous' })
    expect(prevButtons[0]).toBeDisabled()
  })
})
