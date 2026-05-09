import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import ErrorBoundary from '../components/ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>Hello world</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('shows error UI when child component throws', () => {
    // Suppress React error boundary console errors in test output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function ThrowingComponent(): never {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
    expect(screen.getByText('Reload page')).toBeInTheDocument()

    spy.mockRestore()
  })
})
