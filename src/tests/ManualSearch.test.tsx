import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import ManualSearch from '../components/ManualSearch'
import { getCandidates } from '../services/api'
import { mockCandidatesResponse, mockEmptyResponse, mockPaginatedResponse } from './fixtures'

vi.mock('../services/api')

function getFilterField(labelText: string): HTMLElement {
  const labels = screen.getAllByText(labelText)
  const filterLabel = labels.find(el =>
    el.classList.contains('uppercase') && el.classList.contains('tracking-wide')
  ) || labels[0]
  const container = filterLabel.closest('div')!
  return container.querySelector('select') || container.querySelector('input')!
}

async function renderAndWaitForLoad() {
  render(<ManualSearch />)
  await waitFor(() => {
    expect(screen.queryByText('Loading candidates...')).not.toBeInTheDocument()
  })
}

describe('ManualSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCandidates).mockResolvedValue(mockCandidatesResponse)
  })

  it('renders loading state initially', () => {
    vi.mocked(getCandidates).mockReturnValue(new Promise(() => {}))
    render(<ManualSearch />)
    expect(screen.getByText('Loading candidates...')).toBeInTheDocument()
    expect(screen.getByText('Candidates (...)')).toBeInTheDocument()
  })

  it('displays candidates after loading', async () => {
    await renderAndWaitForLoad()

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Python, React')).toBeInTheDocument()
    expect(screen.getByText('Candidates (1)')).toBeInTheDocument()
  })

  it('renders all filter fields', async () => {
    await renderAndWaitForLoad()

    const filterLabels = ['Location', 'Grade', 'SC Clearance', 'Availability', 'Role', 'Skills']
    for (const label of filterLabels) {
      const elements = screen.getAllByText(label)
      const hasFilterLabel = elements.some(el =>
        el.classList.contains('uppercase') && el.classList.contains('tracking-wide')
      )
      expect(hasFilterLabel).toBe(true)
    }
  })

  it('triggers a new API call when a filter is changed', async () => {
    const user = userEvent.setup()
    await renderAndWaitForLoad()

    expect(getCandidates).toHaveBeenCalledTimes(1)

    await user.selectOptions(getFilterField('Location'), 'UK')

    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledTimes(2)
    })
    expect(getCandidates).toHaveBeenLastCalledWith(
      expect.objectContaining({ country: 'UK', page: 1, limit: 25 })
    )
  })

  it('resets filters when the Reset button is clicked', async () => {
    const user = userEvent.setup()
    await renderAndWaitForLoad()

    await user.selectOptions(getFilterField('Location'), 'Ireland')
    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(expect.objectContaining({ country: 'Ireland' }))
    })

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    await waitFor(() => {
      const lastCall = vi.mocked(getCandidates).mock.calls.at(-1)?.[0]
      expect(lastCall).not.toHaveProperty('country')
    })
  })

  it('shows pagination controls when total > 25', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    await renderAndWaitForLoad()

    expect(screen.getAllByRole('button', { name: 'Previous' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Next' }).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Page 1 of 2').length).toBeGreaterThan(0)
  })

  it('calls API with page=2 when clicking Next', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    await renderAndWaitForLoad()

    await user.click(screen.getAllByRole('button', { name: 'Next' })[0])
    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 25 }))
    })
  })

  it('calls API with page=1 when clicking Previous from page 2', async () => {
    const user = userEvent.setup()
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    await renderAndWaitForLoad()

    await user.click(screen.getAllByRole('button', { name: 'Next' })[0])
    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    })

    await user.click(screen.getAllByRole('button', { name: 'Previous' })[0])
    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })
  })

  it('disables Previous button on first page', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockPaginatedResponse)
    await renderAndWaitForLoad()

    expect(screen.getAllByRole('button', { name: 'Previous' })[0]).toBeDisabled()
  })

  it('does not show pagination when total <= 25', async () => {
    await renderAndWaitForLoad()

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('displays error message when API fails', async () => {
    vi.mocked(getCandidates).mockRejectedValue(new Error('Network error'))
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows empty state when no results match', async () => {
    vi.mocked(getCandidates).mockResolvedValue(mockEmptyResponse)
    render(<ManualSearch />)

    await waitFor(() => {
      expect(screen.getByText('No candidates match your current filters. Try adjusting your selections.')).toBeInTheDocument()
    })
  })

  it('sends availability filter as a number', async () => {
    const user = userEvent.setup()
    await renderAndWaitForLoad()

    await user.selectOptions(getFilterField('Availability'), '>= 50%')
    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(expect.objectContaining({ availability: 50 }))
    })
  })

  it('sends text input filters to the API', async () => {
    const user = userEvent.setup()
    await renderAndWaitForLoad()

    await user.type(screen.getByPlaceholderText('Search role...'), 'Engineer')
    await waitFor(() => {
      expect(getCandidates).toHaveBeenCalledWith(expect.objectContaining({ role: 'Engineer' }))
    })
  })
})
