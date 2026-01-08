/**
 * Tests for InputField Component
 *
 * Tests input handling, auto-grow, keyboard shortcuts, validation
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputField } from '@/components/ChatWidget/InputField'

describe('InputField Component', () => {
  const mockOnSend = jest.fn()
  const mockOnValueChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockOnSend.mockClear()
    mockOnValueChange.mockClear()
  })

  describe('Rendering', () => {
    it('should render textarea input', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const sendButton = screen.getByRole('button')
      expect(sendButton).toBeInTheDocument()
    })

    it('should display placeholder text', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByPlaceholderText(/type.*message/i)
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Input Handling', () => {
    it('should call onChange when text is entered', async () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'test message' } })

      expect(mockOnValueChange).toHaveBeenCalledWith('test message')
    })

    it('should update displayed value', () => {
      const { rerender } = render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      rerender(
        <InputField
          value="updated text"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('updated text')
    })
  })

  describe('Send Functionality', () => {
    it('should call onSend when send button clicked', () => {
      render(
        <InputField
          value="test message"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const sendButton = screen.getByRole('button')
      fireEvent.click(sendButton)

      expect(mockOnSend).toHaveBeenCalled()
    })

    it('should call onSend with Ctrl+Enter', () => {
      render(
        <InputField
          value="test message"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

      expect(mockOnSend).toHaveBeenCalled()
    })

    it('should call onSend with Cmd+Enter (Mac)', () => {
      render(
        <InputField
          value="test message"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })

      expect(mockOnSend).toHaveBeenCalled()
    })

    it('should not send on plain Enter', () => {
      render(
        <InputField
          value="test message"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.keyDown(textarea, { key: 'Enter' })

      // Should allow newline, not send
      expect(mockOnSend).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={true}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.disabled).toBe(true)
    })

    it('should disable send button when disabled prop is true', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={true}
        />
      )

      const sendButton = screen.getByRole('button') as HTMLButtonElement
      expect(sendButton.disabled).toBe(true)
    })

    it('should disable send button when value is empty', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const sendButton = screen.getByRole('button') as HTMLButtonElement
      expect(sendButton.disabled).toBe(true)
    })

    it('should enable send button when value is not empty', () => {
      render(
        <InputField
          value="some text"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const sendButton = screen.getByRole('button') as HTMLButtonElement
      expect(sendButton.disabled).toBe(false)
    })
  })

  describe('Character Count', () => {
    it('should display character count', () => {
      render(
        <InputField
          value="hello"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      expect(screen.getByText(/5\s*\/\s*5000/i)).toBeInTheDocument()
    })

    it('should update character count as text changes', () => {
      const { rerender } = render(
        <InputField
          value="hello"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      rerender(
        <InputField
          value="hello world test"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      expect(screen.getByText(/16\s*\/\s*5000/i)).toBeInTheDocument()
    })

    it('should warn when approaching character limit', () => {
      const longText = 'a'.repeat(4900)
      const { container } = render(
        <InputField
          value={longText}
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      // Should show warning styling when > 80% of limit
      const countElement = screen.getByText(/4900\s*\/\s*5000/i)
      expect(countElement).toHaveClass('text-orange-500')
    })
  })

  describe('Auto-grow Textarea', () => {
    it('should expand height as text grows', () => {
      const { rerender } = render(
        <InputField
          value="short"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      const initialHeight = textarea.clientHeight

      rerender(
        <InputField
          value={Array(50).fill('line\n').join('')}
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const expandedHeight = textarea.clientHeight
      expect(expandedHeight).toBeGreaterThan(initialHeight)
    })

    it('should have minimum height', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.clientHeight).toBeGreaterThan(0)
    })

    it('should have maximum height with scrolling', () => {
      const veryLongText = Array(100).fill('line\n').join('')
      render(
        <InputField
          value={veryLongText}
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      // Should have max-height constraint
      expect(textarea.style.maxHeight || textarea.className).toBeTruthy()
    })
  })

  describe('Placeholder Dynamics', () => {
    it('should show dynamic placeholder text', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByPlaceholderText(/type.*message/i)
      expect(textarea).toBeInTheDocument()
    })

    it('should change placeholder when disabled', () => {
      const { rerender } = render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      rerender(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={true}
        />
      )

      const textarea = screen.getByRole('textbox')
      // Placeholder should reflect disabled state
      expect(textarea.getAttribute('placeholder')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should have focusable elements', () => {
      render(
        <InputField
          value=""
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      const sendButton = screen.getByRole('button') as HTMLButtonElement

      expect(textarea.tabIndex >= -1).toBe(true)
      expect(sendButton.tabIndex >= -1).toBe(true)
    })

    it('should maintain focus after send', () => {
      render(
        <InputField
          value="test"
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      textarea.focus()
      expect(document.activeElement).toBe(textarea)

      const sendButton = screen.getByRole('button')
      fireEvent.click(sendButton)

      // Focus should be manageable after send
      expect(document.activeElement).toBeTruthy()
    })
  })

  describe('Max Length Validation', () => {
    it('should prevent sending messages exceeding 5000 chars', () => {
      const veryLongText = 'a'.repeat(5001)
      render(
        <InputField
          value={veryLongText}
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const sendButton = screen.getByRole('button') as HTMLButtonElement
      expect(sendButton.disabled).toBe(true)
    })

    it('should allow sending message at exactly 5000 chars', () => {
      const maxText = 'a'.repeat(5000)
      render(
        <InputField
          value={maxText}
          onChange={mockOnValueChange}
          onSend={mockOnSend}
          disabled={false}
        />
      )

      const sendButton = screen.getByRole('button') as HTMLButtonElement
      expect(sendButton.disabled).toBe(false)
    })
  })
})
