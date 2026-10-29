// Component logic under Jest's React Native mocks; this is not a device or platform test.
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const App = require('../App').default;
test('start and reset handlers update the displayed message', async () => {
  const { getByText } = await render(React.createElement(App));
  expect(getByText('Готовы начать?')).toBeTruthy();
  await fireEvent.press(getByText('Начать урок'));
  expect(getByText('Урок начался')).toBeTruthy();
  await fireEvent.press(getByText('Сброс'));
  expect(getByText('Готовы начать?')).toBeTruthy();
  await fireEvent.press(getByText('Начать урок'));
  expect(getByText('Урок начался')).toBeTruthy();
});
