import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing when there are no records', () => {
    const { container } = render(
      <Pagination page={1} size={10} total={0} onPageChange={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the visible range for the current page', () => {
    render(<Pagination page={2} size={10} total={35} onPageChange={() => {}} />)
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('35')).toBeInTheDocument()
  })

  it('disables previous on the first page', () => {
    render(<Pagination page={1} size={10} total={35} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('disables next on the last page', () => {
    render(<Pagination page={4} size={10} total={35} onPageChange={() => {}} />)
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('notifies the page change when next is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} size={10} total={35} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Next page'))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('notifies the size change when rows per page changes', async () => {
    const user = userEvent.setup()
    const onSizeChange = vi.fn()
    render(
      <Pagination page={1} size={10} total={35} onPageChange={() => {}} onSizeChange={onSizeChange} />,
    )

    await user.selectOptions(screen.getByLabelText<HTMLSelectElement>('Rows per page'), '25')

    expect(onSizeChange).toHaveBeenCalledWith(25)
  })
})
