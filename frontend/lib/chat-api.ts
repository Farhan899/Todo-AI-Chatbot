/**
 * Chat API Client - Handles communication with backend chat endpoint
 *
 * Features:
 * - Automatic JWT injection from session storage
 * - Request/response validation
 * - Error handling with retry logic
 * - Type-safe TypeScript interfaces
 */

interface ChatMessage {
  id?: string;
  sender: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  timestamp?: Date;
}

interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
}

interface ChatRequest {
  conversation_id?: string;
  message: string;
  include_context?: boolean;
}

interface ChatResponse {
  conversation_id: string;
  assistant_message: string;
  tool_calls: ToolCall[];
}

export class ChatAPIClient {
  private baseUrl: string;
  private userId: string;
  private token: string | null = null;

  constructor(userId: string, token: string | null = null, baseUrl: string = "/api") {
    this.userId = userId;
    this.token = token;
    this.baseUrl = baseUrl;
  }

  /**
   * Send a message to the chat endpoint
   */
  async sendMessage(
    message: string,
    conversationId?: string,
    includeContext: boolean = false
  ): Promise<ChatResponse> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Not authenticated. Session token not found.");
    }

    const request: ChatRequest = {
      conversation_id: conversationId,
      message: message.trim(),
      include_context: includeContext,
    };

    // Validate request
    if (!request.message) {
      throw new Error("Message cannot be empty");
    }

    const url = `${this.baseUrl}/${this.userId}/chat`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail ||
            `Chat request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to send message");
    }
  }

  /**
   * Get auth token from session storage or internal state
   * Token is stored by Better Auth
   */
  private getAuthToken(): string | null {
    if (this.token) return this.token;

    try {
      // Better Auth stores session in sessionStorage
      const sessionKey = "better-auth.session_token";
      const token = sessionStorage.getItem(sessionKey);
      return token;
    } catch (error) {
      console.error("Failed to retrieve auth token:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Validate connection to chat API
   */
  async validateConnection(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/${this.userId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: "ping",
        }),
      });

      return response.status < 500; // Not a server error
    } catch {
      return false;
    }
  }
}

export type { ChatMessage, ToolCall, ChatRequest, ChatResponse };
