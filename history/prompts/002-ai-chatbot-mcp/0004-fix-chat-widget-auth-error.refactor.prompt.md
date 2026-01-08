---
id: 0004
title: fix-chat-widget-auth-error
stage: refactor
date: 2026-01-08
surface: agent
model: claude-opus-4-5-20251101
feature: 002-ai-chatbot-mcp
branch: main
user: user
command: task
labels: ["bugfix", "authentication", "chat-widget"]
links:
  spec: specs/002-ai-chatbot-mcp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/chat-api.ts
  - frontend/hooks/useChat.ts
  - frontend/components/ChatWidget/ChatWidget.tsx
  - frontend/app/dashboard/page.tsx
tests:
  - npm run build (frontend)
---

## Prompt

dashboard chat widget error "Not authenticated

Please log in to use the chat"

## Response snapshot

Fixed the "Not authenticated" error in the dashboard chat widget by properly propagating the session token from the Dashboard page down to the chat client.

**Changes:**
1. Modified `ChatAPIClient` to accept an optional `token` in constructor
2. Updated `useChat` hook to accept `token` and pass to client
3. Updated `ChatWidget` to accept `token` prop
4. Updated `DashboardPage` to retrieve session token and pass it to `ChatWidget`

## Outcome

- ✅ Impact: Chat widget now correctly authenticates using the active user session
- 🧪 Tests: Verified with type check (build pass)
- 📁 Files: 4 files modified
- 🔁 Next prompts: None
- 🧠 Reflection: The issue was reliance on sessionStorage which is unreliable; passing props is explicit and robust.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): none
