// Component logic under Jest's React Native mocks; this is not a device or platform test.
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const App = require('../App').default;
test('presses update the counter and reset it', async () => {
  const { getByText } = await render(React.createElement(App));
  expect(getByText('Completed: 0')).toBeTruthy();
  for (let i = 0; i < 3; i++) await fireEvent.press(getByText('Complete one task'));
  expect(getByText('Completed: 3')).toBeTruthy();
  await fireEvent.press(getByText('Reset'));
  expect(getByText('Completed: 0')).toBeTruthy();
  await fireEvent.press(getByText('Complete one task'));
  expect(getByText('Completed: 1')).toBeTruthy();
});
