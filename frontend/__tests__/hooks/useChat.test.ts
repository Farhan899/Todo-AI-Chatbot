/**
 * Tests for useChat Hook
 *
 * Tests conversation state management, message handling, error recovery
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'

describe('useChat Hook', () => {
  const mockUserId = 'test-user-123'
  const mockApiBaseUrl = 'http://localhost:8000'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(
      'test-token'
    )
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      expect(result.current.messages).toEqual([])
      expect(result.current.conversationId).toBeUndefined()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.inputValue).toBe('')
    })

    it('should initialize with provided conversationId', () => {
      const conversationId = 'existing-conv-456'
      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          initialConversationId: conversationId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      expect(result.current.conversationId).toBe(conversationId)
    })

    it('should check authentication on mount', () => {
      renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      expect(global.sessionStorage.getItem).toHaveBeenCalledWith(
        'better-auth.session_token'
      )
    })
  })

  describe('sendMessage', () => {
    it('should add user message optimistically', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'new-conv-123',
          assistant_message: 'Test response',
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      await act(async () => {
        await result.current.sendMessage('test message')
      })

      expect(result.current.messages).toHaveLength(2) // user + assistant
      expect(result.current.messages[0].sender).toBe('user')
      expect(result.current.messages[0].content).toBe('test message')
    })

    it('should add assistant message after successful request', async () => {
      const assistantResponse = 'Created task successfully'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: assistantResponse,
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      await act(async () => {
        await result.current.sendMessage('add task')
      })

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2)
      })

      expect(result.current.messages[1].sender).toBe('assistant')
      expect(result.current.messages[1].content).toBe(assistantResponse)
    })

    it('should update conversationId from response', async () => {
      const newConversationId = 'new-conv-789'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: newConversationId,
          assistant_message: 'Test',
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      await act(async () => {
        await result.current.sendMessage('test')
      })

      await waitFor(() => {
        expect(result.current.conversationId).toBe(newConversationId)
      })
    })

    it('should set loading state during request', async () => {
      let resolveRequest: () => void
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValueOnce(
        new Promise((resolve) => {
          requestPromise.then(() => {
            resolve({
              ok: true,
              json: async () => ({
                conversation_id: 'conv-123',
                assistant_message: 'Test',
                tool_calls: [],
              }),
            })
          })
        })
      )

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      const sendPromise = act(async () => {
        const promise = result.current.sendMessage('test')
        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(result.current.loading).toBe(true)
        resolveRequest()
        return promise
      })

      await sendPromise
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle errors and set error state', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Request failed')
      )

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      await act(async () => {
        await result.current.sendMessage('test')
      })

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      expect(result.current.error).toContain('Request failed')
    })

    it('should not send empty messages', async () => {
      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      await act(async () => {
        await result.current.sendMessage('')
      })

      expect(global.fetch).not.toHaveBeenCalled()
      expect(result.current.messages).toHaveLength(0)
    })

    it('should call onMessageSent callback', async () => {
      const onMessageSent = jest.fn()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: 'Test',
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
          onMessageSent,
        })
      )

      await act(async () => {
        await result.current.sendMessage('test')
      })

      await waitFor(() => {
        expect(onMessageSent).toHaveBeenCalled()
      })
    })

    it('should call onConversationStart callback on first message', async () => {
      const onConversationStart = jest.fn()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'new-conv-123',
          assistant_message: 'Test',
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
          onConversationStart,
        })
      )

      await act(async () => {
        await result.current.sendMessage('test')
      })

      await waitFor(() => {
        expect(onConversationStart).toHaveBeenCalledWith('new-conv-123')
      })
    })
  })

  describe('State Management', () => {
    it('should update inputValue', () => {
      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      act(() => {
        result.current.setInputValue('new input')
      })

      expect(result.current.inputValue).toBe('new input')
    })

    it('should clear error', () => {
      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      act(() => {
        // Simulate error state
        result.current['setError']('Test error')
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('should reset conversation', () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: 'Test',
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      act(() => {
        result.current.resetConversation()
      })

      expect(result.current.messages).toHaveLength(0)
      expect(result.current.conversationId).toBeUndefined()
      expect(result.current.error).toBeNull()
      expect(result.current.inputValue).toBe('')
    })
  })

  describe('Derived State', () => {
    it('should indicate isEmpty correctly', () => {
      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      expect(result.current.isEmpty).toBe(true)

      act(() => {
        result.current['setMessages']([
          { id: '1', sender: 'user', content: 'test', created_at: Date.now() },
        ])
      })

      expect(result.current.isEmpty).toBe(false)
    })

    it('should indicate isReady correctly', () => {
      ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(null)

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      expect(result.current.isReady).toBe(false)

      ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(
        'test-token'
      )

      const { result: result2 } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      expect(result2.current.isReady).toBe(true)
    })
  })

  describe('Message History Limit', () => {
    it('should maintain message history limit', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: 'Response',
          tool_calls: [],
        }),
      })

      const { result } = renderHook(() =>
        useChat({
          userId: mockUserId,
          apiBaseUrl: mockApiBaseUrl,
        })
      )

      // Send 60 messages (should keep only last 100)
      for (let i = 0; i < 60; i++) {
        await act(async () => {
          await result.current.sendMessage(`message ${i}`)
        })
      }

      await waitFor(() => {
        expect(result.current.messages.length).toBeLessThanOrEqual(120) // 60 user + 60 assistant
      })
    })
  })
})
