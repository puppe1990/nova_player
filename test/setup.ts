import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

let mockUrlCounter = 0;

beforeEach(() => {
  mockUrlCounter = 0;
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => `blob:mock-${++mockUrlCounter}`),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
});
