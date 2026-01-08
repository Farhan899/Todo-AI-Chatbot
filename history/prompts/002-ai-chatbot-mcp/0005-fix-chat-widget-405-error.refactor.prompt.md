---
id: 0005
title: fix-chat-widget-405-error
stage: refactor
date: 2026-01-08
surface: agent
model: claude-opus-4-5-20251101
feature: 002-ai-chatbot-mcp
branch: main
user: user
command: task
labels: ["bugfix", "api", "chat-widget"]
links:
  spec: specs/002-ai-chatbot-mcp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/hooks/useChat.ts
tests:
  - npm run build (frontend)
---

## Prompt

dashboard chat widget error "Chat request failed: 405"

## Response snapshot

Fixed the "405 Method Not Allowed" error in the chat widget.

**Root Cause:**
The `ChatAPIClient` (via `useChat` hook) was defaulting to `apiBaseUrl = "/api"`. This caused the frontend to send requests to `http://localhost:3000/api/...` (the Next.js frontend server), which matched no API route or method, returning 405 (or 404).

The backend API is running on `http://localhost:8000`.

**Fix:**
Updated `frontend/hooks/useChat.ts` to use `(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api"` as the default `apiBaseUrl`. This ensures requests are sent to the correct backend endpoint `http://localhost:8000/api/{userId}/chat`.

## Outcome

- ✅ Impact: Chat requests are now directed to the correct backend URL.
- 🧪 Tests: Verified types via build. Confirmed alignment with other API client configurations.
- 📁 Files: 1 file modified.
- 🔁 Next prompts: None.
- 🧠 Reflection: Default values for URLs should always align with the project's environment configuration strategy.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): none
