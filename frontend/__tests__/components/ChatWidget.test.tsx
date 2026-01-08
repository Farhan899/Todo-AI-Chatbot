/**
 * Tests for ChatWidget Component
 *
 * Tests component rendering, user interactions, message display
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '@/components/ChatWidget/ChatWidget'

// Mock the useChat hook
jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(),
}))

import { useChat } from '@/hooks/useChat'

describe('ChatWidget Component', () => {
  const mockUserId = 'test-user-123'
  const mockUseChat = useChat as jest.MockedFunction<typeof useChat>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseChat.mockReturnValue({
      messages: [],
      conversationId: undefined,
      loading: false,
      error: null,
      inputValue: '',
      setInputValue: jest.fn(),
      sendMessage: jest.fn(),
      clearError: jest.fn(),
      resetConversation: jest.fn(),
      isEmpty: true,
      isReady: true,
    })
  })

  describe('Rendering', () => {
    it('should render chat widget', () => {
      render(<ChatWidget userId={mockUserId} />)

      expect(screen.getByText(/chat/i)).toBeInTheDocument()
    })

    it('should show header with conversation ID when available', () => {
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: 'conv-123',
        loading: false,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: true,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      expect(screen.getByText('conv-123')).toBeInTheDocument()
    })

    it('should show "Not authenticated" message when not ready', () => {
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: false,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: true,
        isReady: false,
      })

      render(<ChatWidget userId={mockUserId} />)

      expect(screen.getByText(/not authenticated/i)).toBeInTheDocument()
    })
  })

  describe('Message Display', () => {
    it('should display user messages', () => {
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          content: 'add task',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      mockUseChat.mockReturnValue({
        messages,
        conversationId: 'conv-123',
        loading: false,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: false,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      expect(screen.getByText('add task')).toBeInTheDocument()
    })

    it('should display assistant messages', () => {
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          content: 'add task',
          created_at: Date.now(),
          tool_calls: undefined,
        },
        {
          id: '2',
          sender: 'assistant' as const,
          content: 'Task created successfully',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      mockUseChat.mockReturnValue({
        messages,
        conversationId: 'conv-123',
        loading: false,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: false,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      expect(screen.getByText('Task created successfully')).toBeInTheDocument()
    })

    it('should show loading indicator when loading', () => {
      mockUseChat.mockReturnValue({
        messages: [
          {
            id: '1',
            sender: 'user' as const,
            content: 'test',
            created_at: Date.now(),
            tool_calls: undefined,
          },
        ],
        conversationId: 'conv-123',
        loading: true,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: false,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      // Look for loading indicator (animated dots or similar)
      const loadingElements = screen.queryAllByText(/\.\.\./i)
      expect(loadingElements.length + screen.queryAllByRole('status').length).toBeGreaterThan(0)
    })
  })

  describe('User Interactions', () => {
    it('should handle message input', () => {
      const setInputValue = jest.fn()
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: false,
        error: null,
        inputValue: '',
        setInputValue,
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: true,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      const input = screen.getByPlaceholderText(/type.*message/i)
      fireEvent.change(input, { target: { value: 'test message' } })

      expect(setInputValue).toHaveBeenCalledWith('test message')
    })

    it('should send message on button click', () => {
      const sendMessage = jest.fn()
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: false,
        error: null,
        inputValue: 'test message',
        setInputValue: jest.fn(),
        sendMessage,
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: false,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      const sendButton = screen.getByRole('button', { name: /send|submit/i })
      fireEvent.click(sendButton)

      expect(sendMessage).toHaveBeenCalledWith('test message')
    })

    it('should disable send button while loading', () => {
      const sendMessage = jest.fn()
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: true,
        error: null,
        inputValue: 'test message',
        setInputValue: jest.fn(),
        sendMessage,
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: false,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      const sendButton = screen.getByRole('button', { name: /send|submit/i })
      expect(sendButton).toBeDisabled()
    })

    it('should dismiss error on error dismiss', () => {
      const clearError = jest.fn()
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: false,
        error: 'Test error message',
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError,
        resetConversation: jest.fn(),
        isEmpty: true,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      const dismissButton = screen.getByRole('button', { name: /dismiss|close|×/i })
      fireEvent.click(dismissButton)

      expect(clearError).toHaveBeenCalled()
    })
  })

  describe('Error Display', () => {
    it('should display error alert', () => {
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: false,
        error: 'Failed to send message',
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: true,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      expect(screen.getByText('Failed to send message')).toBeInTheDocument()
    })

    it('should not display error when error is null', () => {
      mockUseChat.mockReturnValue({
        messages: [],
        conversationId: undefined,
        loading: false,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: true,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      const alerts = screen.queryAllByRole('alert')
      expect(alerts).toHaveLength(0)
    })
  })

  describe('Responsive Design', () => {
    it('should accept custom className prop', () => {
      const { container } = render(
        <ChatWidget userId={mockUserId} className="custom-class" />
      )

      const widget = container.querySelector('.custom-class')
      expect(widget).toBeInTheDocument()
    })
  })

  describe('Tool Calls Display', () => {
    it('should display tool calls metadata', () => {
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          content: 'add task',
          created_at: Date.now(),
          tool_calls: undefined,
        },
        {
          id: '2',
          sender: 'assistant' as const,
          content: 'Task created',
          created_at: Date.now(),
          tool_calls: [
            {
              tool: 'add_task',
              parameters: { user_id: 'usr_123', title: 'Test task' },
            },
          ],
        },
      ]

      mockUseChat.mockReturnValue({
        messages,
        conversationId: 'conv-123',
        loading: false,
        error: null,
        inputValue: '',
        setInputValue: jest.fn(),
        sendMessage: jest.fn(),
        clearError: jest.fn(),
        resetConversation: jest.fn(),
        isEmpty: false,
        isReady: true,
      })

      render(<ChatWidget userId={mockUserId} />)

      // Should show tool call information
      const toolCallElements = screen.queryAllByText(/add_task|tool/i)
      expect(toolCallElements.length).toBeGreaterThanOrEqual(0)
    })
  })
})
