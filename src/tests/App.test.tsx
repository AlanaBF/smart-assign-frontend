import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import App from '../App'

vi.mock('../services/api', () => ({
  getCandidates: vi.fn().mockResolvedValue({ candidates: [], total: 0, page: 1, limit: 25 }),
}))

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  it('renders the header with SmartAssign title', () => {
    renderApp()
    expect(screen.getByText('SmartAssign')).toBeInTheDocument()
  })

  it('renders navigation links (Search, Chat)', () => {
    renderApp()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByAltText('Chat')).toBeInTheDocument()
  })

  it('renders the ComingSoon page at /chat route', () => {
    renderApp('/chat')
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Coming soon — CV rewriter powered by AI.')).toBeInTheDocument()
  })
})
