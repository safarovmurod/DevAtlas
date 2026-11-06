// Component logic under Jest's React Native mocks; this is not a device or platform test.
const { decrement } = require('../App');
test('decrement never goes below zero', () => {
  expect(typeof decrement).toBe('function');
  expect(decrement(2)).toBe(1);
  expect(decrement(1)).toBe(0);
  expect(decrement(0)).toBe(0);
  expect(decrement(5)).toBe(4);
});
