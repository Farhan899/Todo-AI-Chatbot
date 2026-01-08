/**
 * Tests for ChatAPIClient
 *
 * Tests authentication token injection, request/response handling, error scenarios
 */

import { ChatAPIClient, ChatResponse } from '@/lib/chat-api'

describe('ChatAPIClient', () => {
  let client: ChatAPIClient
  const mockUserId = 'test-user-123'
  const mockToken = 'test-jwt-token-xyz'
  const mockApiBaseUrl = 'http://localhost:8000'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(mockToken)
    client = new ChatAPIClient(mockUserId, mockApiBaseUrl)
  })

  describe('Authentication', () => {
    it('should get auth token from sessionStorage', () => {
      const token = client['getAuthToken']()
      expect(global.sessionStorage.getItem).toHaveBeenCalledWith(
        'better-auth.session_token'
      )
      expect(token).toBe(mockToken)
    })

    it('should return null when token not in sessionStorage', () => {
      ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(null)
      const token = client['getAuthToken']()
      expect(token).toBeNull()
    })

    it('should inject Bearer token in request headers', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: 'Test response',
          tool_calls: [],
        }),
      })

      await client.sendMessage('test message')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
    })
  })

  describe('sendMessage', () => {
    it('should send message to correct endpoint', async () => {
      const message = 'add buy groceries'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: '✅ Created task: buy groceries',
          tool_calls: [
            {
              tool: 'add_task',
              parameters: { user_id: mockUserId, title: 'buy groceries' },
            },
          ],
        }),
      })

      const response = await client.sendMessage(message)

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/api/${mockUserId}/chat`,
        expect.any(Object)
      )
      expect(response.assistant_message).toBe('✅ Created task: buy groceries')
    })

    it('should include conversation_id in request if provided', async () => {
      const conversationId = 'existing-conv-456'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: conversationId,
          assistant_message: 'Test',
          tool_calls: [],
        }),
      })

      await client.sendMessage('test message', conversationId)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(conversationId),
        })
      )
    })

    it('should include include_context flag if provided', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          assistant_message: 'Test',
          tool_calls: [],
        }),
      })

      await client.sendMessage('test', undefined, true)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"include_context":true'),
        })
      )
    })

    it('should reject empty messages', async () => {
      await expect(client.sendMessage('')).rejects.toThrow(
        'Message cannot be empty'
      )
    })

    it('should reject messages exceeding 5000 characters', async () => {
      const longMessage = 'a'.repeat(5001)
      await expect(client.sendMessage(longMessage)).rejects.toThrow(
        'Message exceeds maximum length'
      )
    })

    it('should parse valid response', async () => {
      const mockResponse: ChatResponse = {
        conversation_id: 'conv-789',
        assistant_message: 'Here are your tasks',
        tool_calls: [
          {
            tool: 'list_tasks',
            parameters: { user_id: mockUserId },
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await client.sendMessage('list my tasks')

      expect(response).toEqual(mockResponse)
      expect(response.conversation_id).toBe('conv-789')
      expect(response.tool_calls).toHaveLength(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid authentication token' }),
      })

      await expect(client.sendMessage('test')).rejects.toThrow(
        /Invalid authentication token|Unauthorized/
      )
    })

    it('should handle 403 Forbidden', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          detail: 'Access denied: cannot access another user\'s resources',
        }),
      })

      await expect(client.sendMessage('test')).rejects.toThrow(
        /Access denied|Forbidden/
      )
    })

    it('should handle 404 Not Found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Conversation not found' }),
      })

      await expect(client.sendMessage('test', 'invalid-conv')).rejects.toThrow(
        /not found|Not Found/i
      )
    })

    it('should handle 400 Bad Request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Message cannot be empty' }),
      })

      await expect(client.sendMessage('test')).rejects.toThrow(
        /Bad Request|400/
      )
    })

    it('should handle 500 Internal Server Error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          detail: 'An unexpected error occurred processing your message',
        }),
      })

      await expect(client.sendMessage('test')).rejects.toThrow(
        /Internal Server Error|500/
      )
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(client.sendMessage('test')).rejects.toThrow(
        'Network error'
      )
    })

    it('should handle invalid JSON response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(client.sendMessage('test')).rejects.toThrow()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(mockToken)
      expect(client.isAuthenticated()).toBe(true)
    })

    it('should return false when token missing', () => {
      ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue(null)
      expect(client.isAuthenticated()).toBe(false)
    })

    it('should return false when token is empty string', () => {
      ;(global.sessionStorage.getItem as jest.Mock).mockReturnValue('')
      expect(client.isAuthenticated()).toBe(false)
    })
  })

  describe('validateConnection', () => {
    it('should validate connection to backend', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })

      const result = await client.validateConnection()

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/`,
        expect.any(Object)
      )
    })

    it('should return false on connection failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed')
      )

      const result = await client.validateConnection()

      expect(result).toBe(false)
    })

    it('should return false on non-200 response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const result = await client.validateConnection()

      expect(result).toBe(false)
    })
  })
})
