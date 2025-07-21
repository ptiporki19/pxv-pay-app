import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileProfileContent } from '../MobileProfileContent'

// Mock the form submission
const mockSubmit = jest.fn()

describe('MobileProfileContent', () => {
  beforeEach(() => {
    mockSubmit.mockClear()
  })

  it('renders profile header with user information', () => {
    render(<MobileProfileContent />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
  })

  it('displays all form sections', () => {
    render(<MobileProfileContent />)
    
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('shows edit mode when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<MobileProfileContent />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('enables form fields in edit mode', async () => {
    const user = userEvent.setup()
    render(<MobileProfileContent />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    const firstNameInput = screen.getByLabelText('First Name')
    expect(firstNameInput).not.toBeDisabled()
    
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Jane')
    
    expect(firstNameInput).toHaveValue('Jane')
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<MobileProfileContent />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    const firstNameInput = screen.getByLabelText('First Name')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'J')
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    render(<MobileProfileContent />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    const firstNameInput = screen.getByLabelText('First Name')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Jane')
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    })
  })

  it('cancels edit mode', async () => {
    const user = userEvent.setup()
    render(<MobileProfileContent />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('navigates to quick action links', () => {
    render(<MobileProfileContent />)
    
    const securityButton = screen.getByRole('button', { name: /security settings/i })
    expect(securityButton).toBeInTheDocument()
    
    const paymentButton = screen.getByRole('button', { name: /payment methods/i })
    expect(paymentButton).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<MobileProfileContent />)
    
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label')
    })
    
    const switches = screen.getAllByRole('switch')
    switches.forEach(switchEl => {
      expect(switchEl).toHaveAttribute('aria-checked')
    })
  })

  it('displays loading state during submission', async () => {
    const user = userEvent.setup()
    render(<MobileProfileContent />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })
})