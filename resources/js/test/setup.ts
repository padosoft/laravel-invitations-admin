import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// React Testing Library leaves the rendered tree mounted between tests; tearing
// it down keeps each test isolated (no cross-test DOM bleed).
afterEach(() => {
  cleanup();
});
