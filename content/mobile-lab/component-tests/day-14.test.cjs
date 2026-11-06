// Component logic under Jest's React Native mocks; this is not a device or platform test.
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const App = require('../App').default;
test('typing updates the controlled greeting and goal', async () => {
  const { getByPlaceholderText, getByText } = await render(React.createElement(App));
  expect(getByText('Салом, друг!')).toBeTruthy();
  expect(getByText('Цель: пока не записана')).toBeTruthy();
  await fireEvent.changeText(getByPlaceholderText('Имя'), 'Мадина');
  await fireEvent.changeText(getByPlaceholderText('Например: 5 занятий'), '5 занятий');
  expect(getByText('Салом, Мадина!')).toBeTruthy();
  expect(getByText('Цель: 5 занятий')).toBeTruthy();
  await fireEvent.changeText(getByPlaceholderText('Имя'), '');
  expect(getByText('Салом, друг!')).toBeTruthy();
});
