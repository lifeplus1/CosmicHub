// Temporary shim to satisfy TypeScript in test environment where module resolution
// for '@testing-library/user-event' may fail under monorepo path mapping.
declare module '@testing-library/user-event' {
  import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
  const defaultExport: {
    setup(): UserEvent;
  } & any;
  export default defaultExport;
}
