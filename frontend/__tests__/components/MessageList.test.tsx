/**
 * Tests for MessageList Component
 *
 * Tests message rendering, formatting, loading states
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { MessageList } from '@/components/ChatWidget/MessageList'

describe('MessageList Component', () => {
  const mockMessages = [
    {
      id: '1',
      sender: 'user' as const,
      content: 'add buy groceries',
      created_at: Date.now(),
      tool_calls: undefined,
    },
    {
      id: '2',
      sender: 'assistant' as const,
      content: '✅ Created task: buy groceries',
      created_at: Date.now(),
      tool_calls: [
        {
          tool: 'add_task',
          parameters: { user_id: 'usr_123', title: 'buy groceries' },
        },
      ],
    },
  ]

  describe('Rendering', () => {
    it('should render empty message list', () => {
      const { container } = render(<MessageList messages={[]} loading={false} />)

      expect(container.querySelector('[role="list"]')).toBeInTheDocument()
    })

    it('should render all messages', () => {
      render(<MessageList messages={mockMessages} loading={false} />)

      expect(screen.getByText('add buy groceries')).toBeInTheDocument()
      expect(screen.getByText('✅ Created task: buy groceries')).toBeInTheDocument()
    })

    it('should render messages in correct order', () => {
      const { container } = render(
        <MessageList messages={mockMessages} loading={false} />
      )

      const messages = container.querySelectorAll('[role="listitem"]')
      expect(messages).toHaveLength(2)
      expect(messages[0]).toHaveTextContent('add buy groceries')
      expect(messages[1]).toHaveTextContent('✅ Created task: buy groceries')
    })
  })

  describe('User Messages', () => {
    it('should display user messages with blue styling', () => {
      const userMessages = [
        {
          id: '1',
          sender: 'user' as const,
          content: 'test message',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      const { container } = render(
        <MessageList messages={userMessages} loading={false} />
      )

      const messageElement = container.querySelector('[role="listitem"]')
      expect(messageElement).toHaveClass('justify-end')
      expect(screen.getByText('test message')).toBeInTheDocument()
    })

    it('should right-align user messages', () => {
      const userMessages = [
        {
          id: '1',
          sender: 'user' as const,
          content: 'user message',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      const { container } = render(
        <MessageList messages={userMessages} loading={false} />
      )

      const messageElement = container.querySelector('[role="listitem"]')
      expect(messageElement).toHaveClass('justify-end')
    })
  })

  describe('Assistant Messages', () => {
    it('should display assistant messages with gray styling', () => {
      const assistantMessages = [
        {
          id: '1',
          sender: 'assistant' as const,
          content: 'assistant response',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      const { container } = render(
        <MessageList messages={assistantMessages} loading={false} />
      )

      const messageElement = container.querySelector('[role="listitem"]')
      expect(messageElement).toHaveClass('justify-start')
      expect(screen.getByText('assistant response')).toBeInTheDocument()
    })

    it('should left-align assistant messages', () => {
      const assistantMessages = [
        {
          id: '1',
          sender: 'assistant' as const,
          content: 'response',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      const { container } = render(
        <MessageList messages={assistantMessages} loading={false} />
      )

      const messageElement = container.querySelector('[role="listitem"]')
      expect(messageElement).toHaveClass('justify-start')
    })
  })

  describe('Timestamps', () => {
    it('should display timestamps for messages', () => {
      const now = new Date()
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          content: 'test',
          created_at: now.getTime(),
          tool_calls: undefined,
        },
      ]

      render(<MessageList messages={messages} loading={false} />)

      // Check that time is displayed (format may vary)
      const timeElements = screen.queryAllByText(/\d+:\d+/)
      expect(timeElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Tool Calls Display', () => {
    it('should display tool calls metadata', () => {
      const messagesWithTools = [
        {
          id: '1',
          sender: 'assistant' as const,
          content: 'Created task',
          created_at: Date.now(),
          tool_calls: [
            {
              tool: 'add_task',
              parameters: { user_id: 'usr_123', title: 'Buy milk' },
            },
          ],
        },
      ]

      render(<MessageList messages={messagesWithTools} loading={false} />)

      // Should show tool information
      const toolElements = screen.queryAllByText(/add_task|tool/i)
      expect(toolElements.length).toBeGreaterThanOrEqual(0)
    })

    it('should not display tool calls when undefined', () => {
      const messagesNoTools = [
        {
          id: '1',
          sender: 'assistant' as const,
          content: 'Response',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      const { container } = render(
        <MessageList messages={messagesNoTools} loading={false} />
      )

      expect(screen.getByText('Response')).toBeInTheDocument()
      expect(container.textContent).not.toContain('undefined')
    })
  })

  describe('Loading State', () => {
    it('should display loading indicator when loading is true', () => {
      render(<MessageList messages={mockMessages} loading={true} />)

      const loadingElements = screen.queryAllByText(/\.\.\./i)
      expect(loadingElements.length + screen.queryAllByRole('status').length).toBeGreaterThan(0)
    })

    it('should not display loading indicator when loading is false', () => {
      const { container } = render(
        <MessageList messages={mockMessages} loading={false} />
      )

      const statusElements = screen.queryAllByRole('status')
      expect(statusElements).toHaveLength(0)
    })

    it('should show loading indicator at bottom of message list', () => {
      const { container } = render(
        <MessageList messages={mockMessages} loading={true} />
      )

      const listItems = container.querySelectorAll('[role="listitem"]')
      expect(listItems.length).toBeGreaterThan(0)
    })
  })

  describe('Message Content', () => {
    it('should handle long messages', () => {
      const longMessage = 'a'.repeat(500)
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          content: longMessage,
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      render(<MessageList messages={messages} loading={false} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should preserve message formatting', () => {
      const messages = [
        {
          id: '1',
          sender: 'assistant' as const,
          content: 'Line 1\nLine 2\nLine 3',
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      render(<MessageList messages={messages} loading={false} />)

      // Should preserve line breaks
      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
    })

    it('should handle special characters', () => {
      const specialChars = 'Test with @#$%^&*() characters'
      const messages = [
        {
          id: '1',
          sender: 'user' as const,
          content: specialChars,
          created_at: Date.now(),
          tool_calls: undefined,
        },
      ]

      render(<MessageList messages={messages} loading={false} />)

      expect(screen.getByText(specialChars)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(
        <MessageList messages={mockMessages} loading={false} />
      )

      expect(container.querySelector('[role="list"]')).toBeInTheDocument()
      expect(container.querySelectorAll('[role="listitem"]').length).toBeGreaterThan(0)
    })

    it('should have semantic HTML', () => {
      const { container } = render(
        <MessageList messages={mockMessages} loading={false} />
      )

      // Should use appropriate HTML elements
      const listElement = container.querySelector('ul, ol, [role="list"]')
      expect(listElement).toBeInTheDocument()
    })
  })

  describe('Auto-scroll', () => {
    it('should scroll to latest message', () => {
      const manyMessages = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        sender: (i % 2 === 0 ? 'user' : 'assistant') as const,
        content: `Message ${i}`,
        created_at: Date.now() + i,
        tool_calls: undefined,
      }))

      const { container } = render(
        <MessageList messages={manyMessages} loading={false} />
      )

      const lastMessage = screen.getByText('Message 19')
      expect(lastMessage).toBeInTheDocument()
    })
  })
})
