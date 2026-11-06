// Component logic under Jest's React Native mocks; this is not a device or platform test.
const { validate } = require('../App');
test('validate reports title and minutes errors honestly', () => {
  expect(typeof validate).toBe('function');
  expect(validate('', '')).toEqual({ title: 'Название короче трёх символов', minutes: 'Минуты — целое число больше нуля' });
  expect(validate('аб', '0')).toEqual({ title: 'Название короче трёх символов', minutes: 'Минуты — целое число больше нуля' });
  expect(validate('абв', '1.5')).toEqual({ minutes: 'Минуты — целое число больше нуля' });
  expect(validate('  Чтение  ', '30')).toEqual({});
  expect(validate('Чтение', '-3')).toEqual({ minutes: 'Минуты — целое число больше нуля' });
  expect(validate('Чтение', '12abc')).toEqual({ minutes: 'Минуты — целое число больше нуля' });
});
