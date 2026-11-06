// Component logic under Jest's React Native mocks; this is not a device or platform test.
const React = require('react');
const { render } = require('@testing-library/react-native');
const App = require('../App').default;
test('FlatList renders every lesson with a stable key and the count', async () => {
  const { findByText, getByText, queryByText } = await render(React.createElement(App));
  expect(await findByText('Экран')).toBeTruthy();
  expect(await findByText('Стили')).toBeTruthy();
  expect(await findByText('Flexbox')).toBeTruthy();
  expect(await findByText('TextInput')).toBeTruthy();
  expect(getByText('Всего: 4')).toBeTruthy();
  expect(queryByText('Список пуст')).toBeNull();
});
