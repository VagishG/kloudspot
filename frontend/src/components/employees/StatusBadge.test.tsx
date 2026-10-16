import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders Active for a true status', () => {
    render(<StatusBadge status={true} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders Inactive for a false status', () => {
    render(<StatusBadge status={false} />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
