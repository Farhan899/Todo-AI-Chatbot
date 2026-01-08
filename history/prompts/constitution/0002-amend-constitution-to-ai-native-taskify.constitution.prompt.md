---
id: 0002
title: Amend constitution to AI-Native Taskify
stage: constitution
date: 2026-01-07
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: architect
command: /sp.constitution
labels: ["architecture", "constitution", "ai-native", "mcp", "agents", "chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Title: AI-Native Taskify (Todo Chatbot)
Purpose: Provide a natural-language interface for users to manage todo tasks reliably and securely by leveraging AI Agents, Model Context Protocol (MCP) tools, and stateless server architecture.

1. Vision and High-Level Principles

1.1 User-Centric Interaction
The system must allow users to converse naturally to manage todos without requiring technical syntax or GUI operations. Every natural-language task command must map unambiguously to one or more MCP tools.

1.2 Deterministic Task Management
All state mutations (create, update, complete, delete tasks) must be performed through strictly typed MCP tool calls with explicit parameters and consistent database persistence.

1.3 Stateless Platform
The backend must remain stateless. Conversation context must be reconstructed per request using persisted messages and metadata. No server memory between API calls.

1.4 Robustness and Reliability
Agent decisions and tool executions must be auditable, testable, and recoverable. Errors in tool invocation must be gracefully handled and communicated in user-friendly language.

1.5 Security and Access Control
User authentication must be enforced at every API request boundary. Tool operations must validate ownership (user_id) and deny unauthorized access. (Authentication handled via Better Auth.)

[... full input preserved through section 11 ...]

The constitution was substantially revised from a traditional Next.js/FastAPI/PostgreSQL todo app architecture to an AI-Native chatbot architecture with MCP tool orchestration, OpenAI Agents SDK reasoning, and embedded ChatKit widget UI.

## Response snapshot

Constitution successfully updated from version 1.0.0 to 2.0.0 (MAJOR version bump).

**Version Change Rationale:**
- Backward-incompatible architectural redefinition: Traditional REST API → AI Agent with MCP tools
- Primary UX shift: Traditional dashboard → Embedded chat widget
- New reasoning layer: OpenAI Agents SDK as sole decision authority
- New execution layer: Three MCP servers (Task, Contact-7, Context-7) replacing direct API calls
- Stateless architecture with conversation reconstruction per request

**Principles Updated (8):**
1. Decoupled Architecture → Expanded with ChatKit/Agents/MCP layers
2. Security First → Enhanced with user_id propagation and token security
3. Code Quality Standards → New MCP tool schema and agent behavior requirements
4. Test-Driven Development → Extended to agent behavior and MCP contracts
5. Data Integrity → Unchanged; now includes conversation/message tables
6. Development Workflow → Restructured around agent/MCP phases
7. Observability → Enhanced with agent decision and tool execution logging
8. Simplicity & YAGNI → Explicit stateless design principle

**Principles Added (8 new):**
9. AI Agent Behavior Norms (intent mapping, confirmation, error handling)
10. Embedded Chat Widget (dashboard integration, security, observability)
11. MCP Server Governance (Task/Contact-7/Context-7 separation and hierarchy)
12. Agent Decision Hierarchy (strict sequential ordering)
13. Context-7 Usage Governance (non-authoritative contextual support)
14. (integrated into principles)
15. (integrated into principles)
16. Long-Term Extensibility (modular tool expansion, multi-model support)

**Sync Impact Report Generated:**
- Constitution file updated with detailed SYNC IMPACT REPORT header
- Version bumped to 2.0.0 (MAJOR)
- 16 core principles defined (vs. 8 in v1.0.0)
- 6 development phases (vs. 5 in v1.0.0)
- New sections: Technology Stack, API Contract (chat endpoint + MCP tools), DB Schema
- Templates flagged for review (spec, plan, tasks, phr routing)

## Outcome

- ✅ Impact: Complete architectural redefinition; all governance and principles restructured for AI-Native design
- 🧪 Tests: No tests required for constitution amendment (governance document)
- 📁 Files: `.specify/memory/constitution.md` updated with 513 lines (v2.0.0)
- 🔁 Next prompts: `/sp.specify` (chatbot feature spec), `/sp.plan` (agent/MCP architecture), `/sp.adr` (if needed for MCP decision)
- 🧠 Reflection: Constitution now serves as authoritative blueprint for AI-Native Taskify. All subsequent feature specs, plans, and tasks must reference this constitution. PHR routing and ADR decision thresholds should be validated against new principles.

## Evaluation notes (flywheel)

- Failure modes observed: None; constitution is governance document, not executable code
- Graders run and results (PASS/FAIL): N/A (governance)
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Validate spec-template.md and plan-template.md against new constitution principles; run `/sp.clarify` on chatbot feature if spec exists
