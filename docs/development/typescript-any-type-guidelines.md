# Guidelines for Using `any` Type in TypeScript

While we generally avoid using the `any` type to maintain type safety, there are specific scenarios
where it may be necessary. This document outlines our approach to handling these exceptions.

## AI Model Recommendations for TypeScript Type Challenges

When facing complex typing challenges, different AI models have varying strengths that can help:

| Task                             | Recommended Models                | Notes                                                                                                   |
| -------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Complex generic type patterns    | GPT-5, Claude 3.7/4.0             | These models excel at understanding deeply nested generic types and can suggest proper type definitions |
| Type inference debugging         | GPT-5, Claude 3.5, Gemini 2.5 Pro | Good at explaining why TypeScript is inferring specific types                                           |
| Converting `any` to proper types | GPT-5, Claude 3.5/3.7             | Strong at incrementally improving type safety                                                           |
| Polymorphic component typing     | GPT-5, Claude 4.0                 | Best at solving React component typing challenges                                                       |
| Migration from JS to TS          | GPT-4o, o3 mini, Claude 3.5       | Cost-effective for bulk conversions                                                                     |
| Type utility creation            | GPT-5, Claude 3.7/4.0             | Excellent at creating complex conditional types                                                         |
| Performance optimization         | GPT-5, GPT-5 mini                 | Good at reducing type complexity while maintaining safety                                               |
| Quick type fixes                 | o4 mini, GPT-5 mini               | Efficient for straightforward typing issues                                                             |
| ESLint configuration             | GPT-4.1, GPT-4o, Claude 3.5       | Helpful for configuring proper type linting rules                                                       |
| Learning TypeScript types        | GPT-4o, Claude 3.5, o3 mini       | Provide clear, educational explanations                                                                 |

## When `any` Is Acceptable

The `any` type should only be used in the following scenarios:

1. **Complex Generic Type Patterns**: When dealing with highly polymorphic components or functions
   where TypeScript's type system cannot fully express the intended behavior.

2. **Third-Party Libraries**: When interfacing with untyped third-party libraries that don't provide
   type definitions.

3. **Gradual Migration**: Temporarily during migration of legacy JavaScript code to TypeScript.

4. **Type System Limitations**: In rare cases where TypeScript's type system has inherent
   limitations.

## Required Documentation

When using `any`, you **must** include a detailed comment explaining:

1. **Why** the `any` type is necessary in this specific case
2. **What** type safety measures are in place at the boundaries
3. **How** the code ensures type safety despite using `any`

## Example of Properly Documented `any`

```typescript
// Polymorphic components with generics and forwardRef have complex type interactions
// that TypeScript's type system has difficulty modeling precisely. We use 'any' here
// only as an intermediate step in a carefully controlled context, with proper type
// assertions at the boundaries to maintain type safety for consumers of this API.
// The specific challenge is that Inner's generic type parameter can't be directly
// passed to forwardRef without losing type information, but the final component
// needs to maintain polymorphic type behavior.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Forward = React.forwardRef(Inner as any) as unknown as PolymorphicForwardComponent<TDefault>;
```

## Using ESLint Exceptions

To allow specific instances of `any` in your code:

1. Add a detailed comment explaining why `any` is necessary
2. Add the following eslint directive immediately before the line:

   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   ```

## Alternatives to Consider Before Using `any`

Before using `any`, consider these alternatives:

1. **`unknown`**: For values whose type is truly not known, use `unknown` and add type guards.

2. **Generic Types**: Use generics to maintain type safety across functions and components.

3. **Type Predicates**: Create custom type guards with `is` to narrow types safely.

4. **Type Assertions**: Use `as` to assert a more specific type when you know more than TypeScript
   does.

5. **Record<string, unknown>**: For objects with dynamic properties, prefer this over `any`.

## Advanced Type Utilities (Claude 3.7 Specialization)

For complex typing scenarios where `any` seems necessary, consider these advanced utilities:

### Recursive Deep Partial

Useful for partial updates to deeply nested objects:

```typescript
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// Instead of:
function updateNestedConfig(config: any, updates: any): any {
  // ...
}

// Use:
function updateNestedConfig<T>(config: T, updates: DeepPartial<T>): T {
  // ...
}
```

### Safe Type Assertion Function

When interfacing with untyped APIs:

```typescript
function assertType<T>(value: unknown, validator: (v: unknown) => boolean): T {
  if (!validator(value)) {
    throw new TypeError('Value does not match expected type');
  }
  return value as T;
}

// Instead of:
const userData = apiResponse as any;

// Use:
const userData = assertType<UserData>(
  apiResponse,
  (v): v is UserData => typeof v === 'object' && v !== null && 'id' in v && 'name' in v
);
```

### Discriminated Union Helper

For complex state management:

```typescript
type ActionMap<M extends Record<string, any>> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

// Example usage:
type Actions = ActionMap<{
  SET_LOADING: boolean;
  SET_DATA: Array<DataItem>;
  SET_ERROR: Error;
}>[keyof ActionMap<{
  SET_LOADING: boolean;
  SET_DATA: Array<DataItem>;
  SET_ERROR: Error;
}>];
```

### Converting API Responses from `any`

When working with external APIs:

```typescript
// Define a runtime validation schema (using Zod, io-ts, or similar)
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'user']),
  metadata: z.record(z.unknown()).optional(),
});

// Apply validation at the boundary
function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(r => r.json())
    .then(data => UserSchema.parse(data)); // Runtime validation + type assertion
}
```

## Code Review Process

During code review, all instances of `any` should be carefully scrutinized:

1. Is the `any` type truly necessary?
2. Is it properly documented with a clear explanation?
3. Is the scope of `any` minimized to where it's absolutely needed?
4. Are there type guards or assertions at the boundaries to maintain type safety?

## Complex Generic Type Patterns (Claude 3.7 Specialization)

When dealing with advanced TypeScript patterns, these techniques can help avoid `any`:

### Higher-Order Component Type Safety

```typescript
// Instead of using 'any' for HOCs:
type HOC<P> = (Component: ComponentType<P>) => ComponentType<Omit<P, 'theme'>>;

// For multiple wrapped HOCs, use composition types:
type ComposeHOC<TInput, TOutput> = (Component: ComponentType<TInput>) => ComponentType<TOutput>;

type ComposeHOCs<HOCs extends readonly ComposeHOC<any, any>[]> = HOCs extends readonly [
  ComposeHOC<infer TInput, any>,
  ...infer Rest,
]
  ? Rest extends readonly ComposeHOC<any, any>[]
    ? Rest extends readonly [ComposeHOC<any, infer TOutput>]
      ? ComposeHOC<TInput, TOutput>
      : Rest extends readonly [...infer Middle, ComposeHOC<any, infer TOutput>]
        ? Middle extends readonly ComposeHOC<any, any>[]
          ? ComposeHOC<TInput, TOutput>
          : never
        : never
    : never
  : never;
```

### Recursive Types for Tree Structures

```typescript
// Avoiding 'any' in tree structures:
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

// For heterogeneous trees:
type HeteroTreeNode<T extends Record<string, unknown>> = {
  type: keyof T;
  value: T[keyof T];
  children: HeteroTreeNode<T>[];
};

// Example usage:
type DocumentNode = HeteroTreeNode<{
  text: string;
  image: { src: string; alt?: string };
  list: { ordered: boolean };
}>;
```

### Type-Safe Event Systems

```typescript
// Instead of using 'any' for event payloads:
type EventMap = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; timestamp: number };
  'data:update': { entity: string; changes: Record<string, unknown> };
};

type EventKey = keyof EventMap;
type EventPayload<K extends EventKey> = EventMap[K];

class TypedEventEmitter {
  emit<K extends EventKey>(event: K, payload: EventPayload<K>): void {
    // Implementation
  }

  on<K extends EventKey>(event: K, callback: (payload: EventPayload<K>) => void): void {
    // Implementation
  }
}
```

Remember: The goal is not to eliminate `any` completely, but to ensure it's used responsibly and
only when necessary.
