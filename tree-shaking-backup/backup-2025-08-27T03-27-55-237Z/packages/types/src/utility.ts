/**
 * Shared foundational utility types for cross-package use.
 * Centralizing these avoids re-defining loose "Record<string, any>" patterns
 * and encourages explicit unknown usage + gradual refinement.
 */

// JSON primitives and structured values
// Define JSON structures using interfaces with explicit members to satisfy lint rules
}

// Narrow record types

// Deep partial helper
};

// Brand utility (nominal typing)

// Result discriminated unions
  value: T;
}
  error: E;
}

// Function helpers

// Predicate type

// Exhaustive check helper
