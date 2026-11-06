// Component logic under Jest's React Native mocks; this is not a device or platform test.
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const App = require('../App').default;
test('children update the shared parent state', async () => {
  const { getByText } = await render(React.createElement(App));
  expect(getByText('Выполнено: 0')).toBeTruthy();
  await fireEvent.press(getByText('Отметить'));
  await fireEvent.press(getByText('Отметить'));
  expect(getByText('Выполнено: 2')).toBeTruthy();
  await fireEvent.press(getByText('Сбросить'));
  expect(getByText('Выполнено: 0')).toBeTruthy();
});
