---
Status: Draft
Owner: Experimentation Lead
Last-Updated: 2025-08-16
Next-Review: 2025-09-10
Source: Grok Generated
---
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Experiment Registry Schema",
  "description": "JSON schema for documenting experiments in the registry, including hypothesis, metrics, dates, and status.",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for the experiment (e.g., UUID or auto-generated ID)."
    },
    "name": {
      "type": "string",
      "description": "Human-readable name of the experiment."
    },
    "hypothesis": {
      "type": "string",
      "description": "Detailed description of the experiment's hypothesis."
    },
    "metrics": {
      "type": "object",
      "description": "Metrics configuration for the experiment.",
      "properties": {
        "primary": {
          "type": "string",
          "description": "The primary metric to evaluate the experiment's success (e.g., 'conversion_rate')."
        },
        "guardrails": {
          "type": "array",
          "description": "Array of guardrail metrics to monitor for safety (e.g., ['user_retention', 'error_rate']).",
          "items": {
            "type": "string"
          },
          "minItems": 0
        }
      },
      "required": ["primary", "guardrails"],
      "additionalProperties": false
    },
    "start_date": {
      "type": "string",
      "format": "date-time",
      "description": "Start date and time of the experiment in ISO 8601 format (e.g., '2025-08-16T00:00:00Z')."
    },
    "end_date": {
      "type": "string",
      "format": "date-time",
      "description": "End date and time of the experiment in ISO 8601 format (e.g., '2025-09-16T23:59:59Z')."
    },
    "segment": {
      "type": "string",
      "description": "User segment or group targeted by the experiment (e.g., 'premium_users')."
    },
    "owner": {
      "type": "string",
      "description": "Owner or responsible party for the experiment (e.g., username or email)."
    },
    "status": {
      "type": "string",
      "description": "Current status of the experiment.",
      "enum": ["planned", "running", "completed", "aborted", "analyzing"]
    }
  },
  "required": ["id", "name", "hypothesis", "metrics", "start_date", "end_date", "segment", "owner", "status"],
  "additionalProperties": false
}