---
title: Experiment Registry Schema
owner: experimentation
status: active
last_reviewed: 2025-09-02
review_cycle: 30d
category: guide
---

## Experiment Registry Schema

JSON Schema definition for structuring experiment metadata (hypothesis, metrics, lifecycle) used by
the experimentation program.

## Usage

1. Create a new experiment entry file (`experiments/<id>.json`).
2. Validate against this schema (e.g. using `ajv` or an IDE JSON schema association).
3. Keep `status` updated as the experiment progresses.

## Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Experiment Registry Schema",
  "description": "JSON schema for documenting experiments in the registry, including hypothesis, metrics, dates, and status.",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier (UUID or auto-generated)."
    },
    "name": {
      "type": "string",
      "description": "Human-readable name."
    },
    "hypothesis": {
      "type": "string",
      "description": "Detailed hypothesis statement."
    },
    "metrics": {
      "type": "object",
      "description": "Primary + guardrail metrics configuration.",
      "properties": {
        "primary": {
          "type": "string",
          "description": "Primary success metric (e.g., conversion_rate)."
        },
        "guardrails": {
          "type": "array",
          "description": "Guardrail metrics (e.g., user_retention, error_rate).",
          "items": { "type": "string" },
          "minItems": 0
        }
      },
      "required": ["primary", "guardrails"],
      "additionalProperties": false
    },
    "start_date": {
      "type": "string",
      "format": "date-time",
      "description": "Experiment start timestamp (ISO 8601)."
    },
    "end_date": {
      "type": "string",
      "format": "date-time",
      "description": "Planned/actual end timestamp (ISO 8601)."
    },
    "segment": {
      "type": "string",
      "description": "Targeted user segment."
    },
    "owner": {
      "type": "string",
      "description": "Responsible party (username or email)."
    },
    "status": {
      "type": "string",
      "description": "Lifecycle status.",
      "enum": ["planned", "running", "completed", "aborted", "analyzing"]
    }
  },
  "required": [
    "id",
    "name",
    "hypothesis",
    "metrics",
    "start_date",
    "end_date",
    "segment",
    "owner",
    "status"
  ],
  "additionalProperties": false
}
```

## Review Notes

- Review cycle set to 30d to align with typical experiment cadence.
- Update `last_reviewed` when schema fields change or governance rules evolve.
