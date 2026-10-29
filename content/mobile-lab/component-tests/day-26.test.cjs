// Component logic under Jest's React Native mocks; this is not a device or platform test.
const React = require('react');
const { render } = require('@testing-library/react-native');
const { LessonFeed } = require('../App');
test('the feed shows loading, empty, populated and error states honestly', async () => {
  const { getByText, queryByText } = await render(React.createElement(LessonFeed, { status: 'loading', items: [] }));
  expect(getByText('Загрузка…')).toBeTruthy();
  await render(React.createElement(LessonFeed, { status: 'done', items: [] }));
  expect(getByText('Пока занятий нет.')).toBeTruthy();
  const second = await render(React.createElement(LessonFeed, { status: 'done', items: ['Экран', 'Стили'] }));
  expect(second.getByText('Экран')).toBeTruthy();
  expect(second.queryByText('Пока занятий нет.')).toBeNull();
  const third = await render(React.createElement(LessonFeed, { status: 'error', items: [] }));
  expect(third.getByText('Не удалось загрузить. Попробуйте позже.')).toBeTruthy();
  expect(third.queryByText('Загрузка…')).toBeNull();
});
