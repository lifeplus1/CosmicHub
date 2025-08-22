# Google Cloud Type Stubs Implementation

## Overview

This document describes our implementation of TypeScript and Python type stubs for Google Cloud
services. These type stubs enhance developer experience and code safety when interacting with Google
Cloud APIs.

## Python Type Stubs

### Implementation Strategy

We've created comprehensive `.pyi` type stub files for the following Google Cloud libraries:

1. **Firestore**: `google/cloud/firestore.pyi`
2. **Storage**: `google/cloud/storage.pyi`
3. **PubSub**: `google/cloud/pubsub.pyi`
4. **Secret Manager**: `google/cloud/secretmanager.pyi`
5. **Exceptions**: `google/cloud/exceptions.pyi`

### Type Stub Structure

Each type stub file follows a consistent structure:

```python
# google/cloud/firestore.pyi
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union, Callable, Generator, TypeVar, Generic, overload

T = TypeVar('T')
DocumentSnapshot = TypeVar('DocumentSnapshot')

class Client:
    def __init__(
        self,
        project: Optional[str] = None,
        credentials: Optional[Any] = None,
        database: str = "(default)"
    ) -> None: ...

    def collection(self, collection_path: str) -> CollectionReference: ...
    def collection_group(self, collection_id: str) -> CollectionGroup: ...
    def document(self, document_path: str) -> DocumentReference: ...
    def get_all(self, references: List[DocumentReference],
                field_paths: Optional[List[str]] = None,
                transaction: Optional[Transaction] = None) -> List[DocumentSnapshot]: ...
    # Additional methods...

class CollectionReference:
    def __init__(self, collection_path: str, client: Client) -> None: ...
    def document(self, document_path: Optional[str] = None) -> DocumentReference: ...
    def add(self, document_data: Dict[str, Any],
            document_id: Optional[str] = None) -> Tuple[DocumentReference, Any]: ...
    def where(self, field_path: str, op_string: str, value: Any) -> Query: ...
    def order_by(self, field_path: str, direction: Optional[str] = None) -> Query: ...
    def limit(self, count: int) -> Query: ...
    def stream(self, transaction: Optional[Transaction] = None) -> Generator[DocumentSnapshot, None, None]: ...
    def get(self, transaction: Optional[Transaction] = None) -> List[DocumentSnapshot]: ...
    # Additional methods...

# Additional classes and methods...
```

### Benefits of Type Stubs

1. **Type Safety**: Proper type checking for Google Cloud API calls
2. **Autocompletion**: Enhanced IDE support with method signatures and parameter hints
3. **Documentation**: Type stubs include parameter descriptions
4. **Error Prevention**: Catch misuse of the API at development time

## TypeScript Type Definitions

### TypeScript Type Definition Approach

For TypeScript, we've extended the existing `@google-cloud` type definitions with additional typing
information specific to our usage patterns:

```typescript
// extensions/google-cloud.d.ts
import * as firestore from '@google-cloud/firestore';

declare module '@google-cloud/firestore' {
  interface DocumentData {
    [field: string]: any;
  }

  // Enhanced typing for DocumentSnapshot
  interface DocumentSnapshot<T = DocumentData> {
    exists: boolean;
    id: string;
    createTime: firestore.Timestamp;
    updateTime: firestore.Timestamp;
    readTime: firestore.Timestamp;
    ref: DocumentReference<T>;
    data(): T | undefined;
    get(fieldPath: string | FieldPath): any;
  }

  // Generic query typings
  interface Query<T = DocumentData> {
    where(fieldPath: string | FieldPath, opStr: firestore.WhereFilterOp, value: any): Query<T>;
    orderBy(fieldPath: string | FieldPath, directionStr?: firestore.OrderByDirection): Query<T>;
    limit(limit: number): Query<T>;
    offset(offset: number): Query<T>;
    select(...field: string[]): Query<T>;
    startAt(snapshot: DocumentSnapshot<T>): Query<T>;
    startAt(...fieldValues: any[]): Query<T>;
    startAfter(snapshot: DocumentSnapshot<T>): Query<T>;
    startAfter(...fieldValues: any[]): Query<T>;
    endBefore(snapshot: DocumentSnapshot<T>): Query<T>;
    endBefore(...fieldValues: any[]): Query<T>;
    endAt(snapshot: DocumentSnapshot<T>): Query<T>;
    endAt(...fieldValues: any[]): Query<T>;
    get(): Promise<QuerySnapshot<T>>;
  }

  // Additional type extensions...
}
```

### Usage with Our Data Models

We've integrated these type definitions with our domain models:

```typescript
// Using the enhanced type definitions
import { Firestore, DocumentReference, CollectionReference } from '@google-cloud/firestore';
import { AstrologyChart, UserProfile } from '../types';

// Type-safe Firestore access
export class ChartRepository {
  private readonly collection: CollectionReference<AstrologyChart>;

  constructor(private firestore: Firestore) {
    this.collection = firestore.collection('charts') as CollectionReference<AstrologyChart>;
  }

  async getById(id: string): Promise<AstrologyChart | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data()!; // Type is AstrologyChart
  }

  async findByUserId(userId: string): Promise<AstrologyChart[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data()); // Type is AstrologyChart[]
  }

  // Additional methods...
}
```

## Integration with Type Guards

Our type stubs work seamlessly with our type guards for complete type safety:

### Python Example

```python
from google.cloud import firestore
from typing import Dict, List, Optional, cast

from api.utils.type_guards import is_astrology_chart, AstrologyChart

def get_user_charts(user_id: str) -> List[AstrologyChart]:
    db = firestore.Client()
    charts_ref = db.collection('charts')
    query = charts_ref.where('userId', '==', user_id)

    results: List[AstrologyChart] = []

    for doc in query.stream():
        data = doc.to_dict()
        # Validate using type guard
        if is_astrology_chart(data):
            # Safe to cast after validation
            chart = cast(AstrologyChart, data)
            results.append(chart)
        else:
            # Log error but continue processing
            print(f"Invalid chart data in document {doc.id}")

    return results
```

### TypeScript Example

```typescript
import { firestore } from '@google-cloud/firestore';
import { isAstrologyChart, AstrologyChart } from '../types/type-guards';

async function getUserCharts(userId: string): Promise<AstrologyChart[]> {
  const db = new firestore.Firestore();
  const chartsRef = db.collection('charts');
  const query = chartsRef.where('userId', '==', userId);

  const snapshot = await query.get();
  const results: AstrologyChart[] = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    // Validate using type guard
    if (isAstrologyChart(data)) {
      results.push(data);
    } else {
      // Log error but continue processing
      console.error(`Invalid chart data in document ${doc.id}`);
    }
  });

  return results;
}
```

## Handling Missing Type Information

For parts of the API without official types, we've created comprehensive mappings:

### Python Example (Secret Manager)

```python
# google/cloud/secretmanager.pyi
from typing import Any, Dict, List, Optional, Sequence

class SecretManagerServiceClient:
    def __init__(
        self,
        credentials: Optional[Any] = None,
        transport: Optional[str] = None
    ) -> None: ...

    def create_secret(
        self,
        request: Optional[Dict[str, Any]] = None,
        *,
        parent: Optional[str] = None,
        secret_id: Optional[str] = None,
        secret: Optional[Dict[str, Any]] = None,
        retry: Optional[Any] = None,
        timeout: Optional[float] = None,
        metadata: Optional[Sequence[Tuple[str, str]]] = None
    ) -> Dict[str, Any]: ...

    def add_secret_version(
        self,
        request: Optional[Dict[str, Any]] = None,
        *,
        parent: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        retry: Optional[Any] = None,
        timeout: Optional[float] = None,
        metadata: Optional[Sequence[Tuple[str, str]]] = None
    ) -> Dict[str, Any]: ...

    def access_secret_version(
        self,
        request: Optional[Dict[str, Any]] = None,
        *,
        name: Optional[str] = None,
        retry: Optional[Any] = None,
        timeout: Optional[float] = None,
        metadata: Optional[Sequence[Tuple[str, str]]] = None
    ) -> Dict[str, Any]: ...

    # Additional methods...
```

### TypeScript Example (Storage)

```typescript
// extensions/google-cloud-storage.d.ts
declare module '@google-cloud/storage' {
  interface StorageOptions {
    projectId?: string;
    keyFilename?: string;
    credentials?: {
      client_email?: string;
      private_key?: string;
    };
    autoRetry?: boolean;
    maxRetries?: number;
  }

  interface BucketOptions {
    userProject?: string;
    preconditionOpts?: {
      ifGenerationMatch?: number;
      ifGenerationNotMatch?: number;
      ifMetagenerationMatch?: number;
      ifMetagenerationNotMatch?: number;
    };
  }

  interface GetFilesOptions {
    prefix?: string;
    delimiter?: string;
    autoPaginate?: boolean;
    maxResults?: number;
    pageToken?: string;
    versions?: boolean;
  }

  // Additional interfaces...
}
```

## Custom Utility Types

We've also created utility types to make working with Google Cloud APIs easier:

```typescript
// utilities/firestore-helpers.ts
export type WithId<T> = T & { id: string };

export function withId<T>(doc: FirebaseFirestore.DocumentSnapshot): WithId<T> | null {
  const data = doc.data() as T | undefined;
  if (!data) return null;
  return { ...data, id: doc.id };
}

export async function getDocumentWithId<T>(
  docRef: FirebaseFirestore.DocumentReference
): Promise<WithId<T> | null> {
  const doc = await docRef.get();
  if (!doc.exists) return null;
  return withId<T>(doc);
}

// Additional utility functions...
```

## Best Practices

1. **Keep Stubs Updated**: Update type stubs when Google Cloud libraries are upgraded
2. **Validate All Data**: Always validate data retrieved from Firestore before processing
3. **Use Strong Types**: Use specific types rather than `any` wherever possible
4. **Test with Real Services**: Ensure type stubs match actual service behavior
5. **Documentation**: Include examples of how to use the typed APIs

## Next Steps

1. **Expand Coverage**: Create type stubs for additional Google Cloud services
2. **Enhance Generic Support**: Add better support for generic types in collections
3. **Automate Updates**: Set up automation to keep type stubs in sync with library versions
4. **Share with Community**: Consider contributing our type stubs back to the community

---

Document created: August 19, 2025
