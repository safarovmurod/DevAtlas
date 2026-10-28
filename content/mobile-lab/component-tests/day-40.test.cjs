// Component logic under Jest's React Native mocks; this is not a device or platform test.
const { validateTitle } = require('../App');
test('validateTitle accepts honest titles and rejects garbage', () => {
  expect(typeof validateTitle).toBe('function');
  expect(validateTitle('')).toBe('Название короче трёх символов');
  expect(validateTitle('аб')).toBe('Название короче трёх символов');
  expect(validateTitle('  ')).toBe('Название короче трёх символов');
  expect(validateTitle('Чтение')).toBeNull();
  expect(validateTitle('Чтение вслух каждый вечер')).toBeNull();
  expect(validateTitle('x'.repeat(41))).toBe('Название длиннее сорока символов');
  expect(validateTitle('x'.repeat(40))).toBeNull();
});
