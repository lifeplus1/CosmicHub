# Incident Runbook Template

Status: Adopted Owner: Reliability Lead Last-Updated: 2025-08-16 Next-Review: 2025-11-01 Source:
Manual

## 1. Summary

Concise one-paragraph description (what failed, user-facing impact, current status).

## 2. Impact

- Affected services / endpoints
- % traffic/users impacted
- SLO error budget burn (if applicable)

## 3. Detection

- How detected (alert name, synthetic check, user report)
- Time first signal vs acknowledgment

## 4. Timeline

| Time (UTC) | Event       |
| ---------- | ----------- |
| 12:03      | Alert fired |
| ...        | ...         |

## 5. Current Mitigation Status

- Mitigation in place? Y/N
- Risk of regression

## 6. Triage Checklist

1. Confirm scope (metrics & logs)
2. Reproduce / isolate component
3. Identify recent changes (deploy diff)
4. Assess external dependencies health

## 7. Mitigation Options

| Option | Description | Trade-offs |
| ------ | ----------- | ---------- |

## 8. Communications

- Internal: #ops channel update cadence (every 15m)
- External (if required): Status page message template

## 9. Root Cause (Post-Stabilization)

Placeholder until postmortem.

## 10. Follow-up Actions

Track in issue tracker; label: `incident-followup`.

## 11. Lessons Learned (Populate post-incident)

Version: v0.1
