# Technical Architecture Specification: SignalForge v2

## 1. Data Layer (Optimized for Multi-Tenancy)
Currently using Firestore with a hierarchical workspace model:
- `/workspaces/{wsId}`: Config, Strategy, Billing.
- `/workspaces/{wsId}/projects`: The content units.
- `/workspaces/{wsId}/agents`: Custom system prompts per team.
- `/workspaces/{wsId}/audit`: Compliance and history logs.

## 2. AI Multi-Agent Orchestrator
We use a **Chain-of-Thought (CoT)** orchestration pattern in `server.ts`:
1. **Input Processor**: Sanitizes and extracts metadata.
2. **Contextual Primary**: Fetches Workspace Strategy.
3. **Sequential Agents**: Flash-3-Preview agents for speed, Pro-3.1 for final synthesis.
4. **Validation Layer**: Compliance and Sentiment analysis before output.

## 3. Scalability Improvements (Plan)
- **Caching**: Implement Redis for Google Search grounding results (30m TTL).
- **Webhooks**: Event-driven architecture for background long-running generations.
- **RAG Implementation**: Using Firestore vector search (planned) to inject brand memories into prompts.
