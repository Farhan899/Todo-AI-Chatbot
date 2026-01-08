import { authClient } from "./auth-client";
import { Task, TaskCreate, TaskUpdate } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get Authorization header with JWT from Better Auth session
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  // Ensure we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error("Not in browser environment");
  }

  const session = await authClient.getSession();

  if (!session?.data?.user?.id || !session?.data?.session?.token) {
    throw new Error("Not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.data.session.token}`,
  };
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string> {
  // Ensure we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error("Not in browser environment");
  }

  const session = await authClient.getSession();

  if (!session?.data?.user?.id) {
    throw new Error("Not authenticated");
  }

  return session.data.user.id;
}

/**
 * Handle API response errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * List all tasks for the authenticated user
 */
export async function listTasks(): Promise<Task[]> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
    method: "GET",
    headers,
  });

  return handleResponse<Task[]>(response);
}

/**
 * Create a new task
 */
export async function createTask(data: TaskCreate): Promise<Task> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: number, data: TaskUpdate): Promise<Task> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number): Promise<void> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}`, {
    method: "DELETE",
    headers,
  });

  return handleResponse<void>(response);
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: number): Promise<Task> {
  const userId = await getCurrentUserId();
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/${userId}/tasks/${taskId}/complete`, {
    method: "PATCH",
    headers,
  });

  return handleResponse<Task>(response);
}
