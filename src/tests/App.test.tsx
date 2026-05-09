import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import App from '../App'

function renderApp() {
  return render(
    <MemoryRouter>
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
})
