// Component logic under Jest's React Native mocks; this is not a device or platform test.
const { applyEdit, removeTask } = require('../App');
const base = [
  { id: 'a', title: 'Экран', minutes: 20, createdAt: 1 },
  { id: 'b', title: 'Списки', minutes: 30, createdAt: 2 },
];
test('applyEdit changes only the chosen record', () => {
  const edited = applyEdit(base, 'b', '  Ключи  ', 45);
  expect(edited[0]).toEqual(base[0]);
  expect(edited[1]).toEqual({ id: 'b', title: 'Ключи', minutes: 45, createdAt: 2 });
  expect(base[1].title).toBe('Списки');
});
test('removeTask deletes exactly one record', () => {
  const rest = removeTask(base, 'a');
  expect(rest).toHaveLength(1);
  expect(rest[0].id).toBe('b');
  expect(removeTask(base, 'missing')).toHaveLength(2);
});
