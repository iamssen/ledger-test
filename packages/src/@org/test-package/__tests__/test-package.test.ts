import { testFunction } from '@org/test-package';

describe('test-package', () => {
  test('should succeed test', () => {
    expect(testFunction()).toBe('hello');
  });
});
