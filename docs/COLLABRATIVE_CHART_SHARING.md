# User Story Map for Real-Time Collaborative Chart Sharing

To integrate real-time collaborative chart sharing into our astrology app, we'll focus on enabling users to share and edit natal, synastry, or transit charts collaboratively. This feature enhances marketability by fostering community interactions (e.g., group interpretations during transits) and ties into premium subscriptions for advanced sessions. We'll prioritize performance (low-latency updates via efficient data syncing), scalability (handling multiple participants with Firestore/Redis caching), modularity (shared packages for entities and hooks), security (Firestore rules for permissions), and type safety (strict TypeScript/Pydantic schemas). Accessibility will ensure WCAG compliance, e.g., ARIA labels for cursor events and comments.

The user story map is structured as **Backbone** (core user journeys), **Activities** (key steps within journeys), and **Tasks** (granular actions). Entities like CollaborationSession (manages the session state), Participant (user roles and presence), CursorEvent (real-time pointer tracking), and CommentThread (threaded discussions on chart elements) are woven in for robustness.

## Backbone: Core User Journeys

1. **Initiate and Join Collaboration**: Users create or join a session to share charts in real-time.
2. **Interact in Real-Time**: Participants view, edit, and discuss chart elements simultaneously.
3. **Manage Session Lifecycle**: Handle presence, syncing, and termination to ensure data integrity.

## Activities and Tasks

### Backbone 1: Initiate and Join Collaboration

- Task: Select a chart (e.g., natal or synastry) from saved profiles and generate a CollaborationSession entity (id, participants, permissions, presence map, lastSync, version).
- Task: Set session metadata (chart type, expiration) and store in Firestore.
- Task: Generate shareable link or invite code with Firebase Auth security checks.
- Task: Authenticate user as Participant, validate permissions, update presence.
- Task: Sync initial chart state (batched Firestore read + Redis cache).
- Task: Broadcast join event to existing participants.

### Backbone 2: Interact in Real-Time

- Task: Track CursorEvent (position, userId) via WebSocket listener; render collaborative cursors.
- Task: Apply edits (house system adjustments, annotations) with optimistic update & rollback.
- Task: Display Participant avatars/tooltips with accessible announcements.
- Task: Create CommentThread tied to chart elements (planet positions) with reply threading.
- Task: Post comments updating Firestore & push notifications.
- Task: Resolve or pin threads; sync version to CollaborationSession.lastSync.

### Backbone 3: Manage Session Lifecycle

- Task: Update Participant presence (online/offline/idle) via heartbeat; handle reconnect.
- Task: Auto-sync and resolve conflicts (consider CRDT for mergeable edits).
- Task: Log session analytics, cache frequent reads.
- Task: End session: set read-only, export final chart (PDF export).
- Task: Cleanup entities (archive CommentThread) via shared utility in `packages/integrations`.
- Task: Trigger premium upsell when free session limits reached.

This map ensures modularity: Entities in `packages/types`, hooks in `packages/ui/hooks`, backend validation (FastAPI + Pydantic). Cleanup: remove redundant auth files in `apps/astro/src/auth.ts` consolidating into `packages/auth`.

### Proposed Low-Latency Architecture Patterns

For real-time collaboration, we need patterns that minimize latency (<100ms updates) while scaling to 100+ participants per session. Integrate with Firestore for persistence and Redis for caching transient data (presence). All patterns enforce type safety (schemas) and security (rate limiting, WebSocket auth).

| Pattern | Description | Pros | Cons |
|---------|-------------|------|------|
| **WebSocket Hub** | Central WebSocket server (e.g., via FastAPI + WebSockets) broadcasts events (CursorEvent, CommentThread updates) to all participants in a CollaborationSession. Firestore listens for changes and hubs relay them. | - Simple implementation with low setup cost; - Excellent for broadcast-heavy ops (e.g., cursor tracking); - Easy integration with existing Firebase for auth/scaling | - Single point of failure if hub overloads; requires horizontal scaling; - Potential consistency issues without additional locking; - Higher server load for large sessions without optimization |
| **CRDT Hybrid** | Use Conflict-Free Replicated Data Types (e.g., Yjs library) for mergeable edits on chart state, hybridized with WebSockets for real-time propagation and Firestore for persistence. Session version increments on merges. | - Handles offline/reconnect seamlessly with automatic conflict resolution; - Reduces latency via local-first updates (optimistic UI); - Scalable for complex entities like CommentThread with branching | - Increased client-side complexity (bundle size impact; mitigate with code splitting); - Learning curve for CRDT libs; potential overkill for simple broadcasts; - Sync overhead if not cached properly in Redis |
| **Event-Sourced Stream** | Events (e.g., CursorEvent, comment additions) are appended to a stream (e.g., Kafka or Firestore streams), with clients subscribing via WebSockets. Rebuild state from event log on join, using lastSync for efficiency. | - High auditability and replayability for robustness (e.g., debug sessions); - Decouples producers/consumers for better scalability; - Integrates well with event-driven backends like FastAPI | - Higher latency for state reconstruction on large logs (optimize with snapshots); - Storage growth for events; needs pruning scripts; - More complex setup, requiring stream management tools |

Recommendation: Start with WebSocket Hub for MVP due to simplicity and performance in our stack (leverages existing TurboRepo caching for fast builds). Enhance with CRDT for production if offline support is prioritized.

### JSON Schema for CollaborationSession

Define this schema in Pydantic (backend) and TypeScript (frontend). Indexed on id/version for efficient queries.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CollaborationSession",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for the session (e.g., UUID)"
    "participants": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "userId": { "type": "string" },
          "role": { "type": "string", "enum": ["host", "editor", "viewer"] },
          "joinedAt": { "type": "string", "format": "date-time" }
        },
        "required": ["userId", "role"]
      },
      "description": "List of Participant entities"
    },
    "permissions": {
      "type": "object",
      "properties": {
        "allowEdits": { "type": "boolean" },
        "allowComments": { "type": "boolean" },
        "public": { "type": "boolean" }
      },
      "required": ["allowEdits", "allowComments"],
      "description": "Session-level access controls"
    },
    "presence": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "status": { "type": "string", "enum": ["online", "offline", "idle"] },
          "lastActive": { "type": "string", "format": "date-time" }
        }
      },
      "description": "Map of userId to presence status for real-time tracking"
    },
    "lastSync": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of the last successful sync"
    },
    "version": {
      "type": "integer",
      "description": "Incrementing version for conflict resolution"
    }
  },
  "required": ["id", "participants", "permissions", "presence", "lastSync", "version"]
}
```

Modular snippet suggestion: In `packages/types/src/index.ts`, add:

```typescript
export interface CollaborationSession {
  id: string;
  participants: Participant[];
  permissions: { allowEdits: boolean; allowComments: boolean; public?: boolean };
  presence: Record<string, { status: 'online' | 'offline' | 'idle'; lastActive: string }>;
  lastSync: string; // ISO date-time
  version: number;
}
```

This ensures consistency across apps, with lazy loading for performance in React components.
