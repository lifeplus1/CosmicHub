# React Hook Patterns & Dependency Management (Draft)

> Draft created August 18, 2025 – consolidates emerging internal conventions while auditing
> `Chart.tsx` & `ChartPreferences.tsx`. Refine after broader adoption.

## Core Principles

1. Determinism: Effects should re-run only when the _semantic inputs_ change.
2. Stability: Prefer `useRef` for mutable, non-reactive objects (caches, controllers) instead of
   suppressing deps.
3. Transparency: Any intentional omission from a dependency array must have an inline comment
   justification.
4. Safety First: Narrow nullable values _before_ using them inside effects / callbacks – reduces
   strict boolean noise and stabilizes deps.
5. Separation: Split effects by concern (data fetch, subscription, DOM side-effect) rather than one
   large effect with conditional branches.

## Dependency Decision Guide

| Situation                                       | Preferred Pattern                                          | Rationale                                     |
| ----------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Referencing props/state primitives              | Include directly                                           | Built-in stability; triggers on actual change |
| Complex object recalculated inline              | Wrap in `useMemo` then depend on memo                      | Prevents repeated effect triggers             |
| Callback passed to child relying on stable refs | Use `useCallback` with precise deps or stable ref wrappers | Avoids unnecessary re-renders                 |
| Mutable instance (AbortController, Map, worker) | Store in `useRef` and mutate                               | Instance stability without re-runs            |
| External singleton (service module)             | Reference directly, exclude from deps with comment         | Module identity is static                     |
| Timer / interval management                     | Keep id in `useRef`                                        | Prevent stale closure & double intervals      |

## Common Patterns

### 1. Controlled Fetch with Abort & Revalidation

```tsx
const abortRef = useRef<AbortController | null>(null);

useEffect(() => {
  abortRef.current?.abort();
  const controller = new AbortController();
  abortRef.current = controller;
  let active = true;

  (async () => {
    try {
      const data = await api.load({ id, signal: controller.signal });
      if (!active) return; // Guard race condition
      setResult(data);
    } catch (err) {
      if ((err as any).name !== 'AbortError') devConsole.error('Load failed:', err);
    }
  })();

  return () => {
    active = false;
    controller.abort();
  };
}, [id]); // Only re-run when the resource identity changes
```

### 2. Stable Callback Depending on Narrowed State

```tsx
const userId = profile?.id ?? null;

const handleSave = useCallback(() => {
  if (!userId) return; // Early guard prevents userId in fn body from being nullable
  persist(userId, draft);
}, [userId, draft]);
```

### 3. Derived Memo for Heavy Computation

```tsx
const normalized = useMemo(() => {
  if (!raw) return [];
  return expensiveNormalize(raw);
}, [raw]);
```

### 4. Event Subscription with Clean Separation

```tsx
useEffect(() => {
  function onMessage(e: MessageEvent) {
    setPayload(e.data);
  }
  channel.addEventListener('message', onMessage);
  return () => channel.removeEventListener('message', onMessage);
}, [channel]);
```

### 5. Selective Omission with Justification

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps -- service is a stable module singleton
useEffect(() => {
  service.primeCache();
}, []);
```

### 6. useRef for Imperative Handles

```tsx
const playerRef = useRef<Player | null>(null);

const ensurePlayer = () => {
  if (!playerRef.current) playerRef.current = createPlayer();
  return playerRef.current;
};
```

## Boolean Expression Normalization

Prefer explicit comparisons:

```tsx
if (value !== null && value !== undefined) {
  /* safe */
}
if (text !== '') {
  /* non-empty string */
}
if (Array.isArray(items) && items.length > 0) {
  /* non-empty list */
}
```

## Anti-Patterns & Fixes

| Anti-Pattern                              | Why Problematic               | Fix                           |
| ----------------------------------------- | ----------------------------- | ----------------------------- |
| Large effect with many unrelated concerns | Hard to reason, noisy deps    | Split per concern             |
| Suppressing deps without comment          | Hidden stale closure risk     | Add justification or refactor |
| Recreating objects inline used in deps    | Forces effect thrash          | Memoize or lift constant      |
| Using objects/functions as flags          | Identity changes unexpectedly | Use primitive booleans/ids    |
| `useEffect(async () => { ... })`          | Implicit Promise handling     | Inline IIFE inside effect     |

## Hook Audit Checklist (Use Per File)

- [ ] Every effect has minimal, sufficient deps
- [ ] No silent dependency omissions
- [ ] All async effects cancel or ignore stale responses
- [ ] Expensive computations wrapped in `useMemo`
- [ ] Stable callbacks via `useCallback` only when passed as prop / dependency-critical
- [ ] `useRef` used for mutable non-reactive instances
- [ ] Boolean guards added before heavy work / callback logic

## Migration Notes

- When reducing `strict-boolean-expressions` noise, add early returns to narrow before hooks.
- Replace patterns like `if (!obj)` with explicit `if (obj === null || obj === undefined)` then
  narrow.
- Prefer creating small custom hooks for repeated logic (e.g., `useAbortableAsync` for fetch flows).

## Next Refinements (Planned)

- Add section on data fetching race prevention patterns.
- Add `useEvent` pattern once standardized.
- Provide examples from `ChartDisplay` once refactor scope approved.

---

Draft complete – update after initial dependency audits.
