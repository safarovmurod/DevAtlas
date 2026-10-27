// Component state under Jest's mocked React Native host, not a native-device test.
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const App = require('../App').default;
test('queued increments and undo preserve the zero boundary', async () => {
  const { getByText } = await render(React.createElement(App));
  expect(getByText('Готово: 0')).toBeTruthy();
  await fireEvent.press(getByText('Завершить два'));
  expect(getByText('Готово: 2')).toBeTruthy();
  await fireEvent.press(getByText('Отменить одно'));
  expect(getByText('Готово: 1')).toBeTruthy();
  await fireEvent.press(getByText('Отменить одно'));
  expect(getByText('Готово: 0')).toBeTruthy();
  await fireEvent.press(getByText('Отменить одно'));
  expect(getByText('Готово: 0')).toBeTruthy();
});
