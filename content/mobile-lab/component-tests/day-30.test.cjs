// Component logic under Jest's React Native mocks; this is not a device or platform test.
const { mergeNotes } = require('../App');
test('mergeNotes keeps fresher records and union of ids', () => {
  expect(typeof mergeNotes).toBe('function');
  const local = [{ id: 'a', text: 'старая', updatedAt: 100 }, { id: 'c', text: 'локальная', updatedAt: 50 }];
  const remote = [{ id: 'a', text: 'новая', updatedAt: 200 }, { id: 'b', text: 'из сети', updatedAt: 10 }];
  const merged = mergeNotes(local, remote);
  const byId = new Map(merged.map(note => [note.id, note]));
  expect(byId.get('a').text).toBe('новая');
  expect(byId.get('b').text).toBe('из сети');
  expect(byId.get('c').text).toBe('локальная');
  expect(merged.length).toBe(3);
  expect(merged[0].updatedAt).toBe(200);
});
