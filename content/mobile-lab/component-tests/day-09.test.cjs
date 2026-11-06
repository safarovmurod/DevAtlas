// Checks React output under a mock host; not native-device validation.
const React = require('react');
const { render } = require('@testing-library/react-native');
const { LessonList } = require('../App');
test('empty and populated lists honor the optional count', async () => {
  expect(typeof LessonList).toBe('function');
  const { getByText, queryByText, rerender } = await render(React.createElement(LessonList,{lessons:[],showCount:true}));
  expect(getByText('Пока занятий нет')).toBeTruthy();
  expect(getByText('Всего: 0')).toBeTruthy();
  const first={id:'a',title:'Один'},second={id:'b',title:'Два'};
  await rerender(React.createElement(LessonList,{lessons:[first],showCount:true}));
  expect(getByText('Один')).toBeTruthy();expect(getByText('Всего: 1')).toBeTruthy();
  expect(queryByText('Пока занятий нет')).toBeNull();
  await rerender(React.createElement(LessonList,{lessons:[first,second],showCount:true}));
  expect(getByText('Один')).toBeTruthy();expect(getByText('Два')).toBeTruthy();expect(getByText('Всего: 2')).toBeTruthy();
  await rerender(React.createElement(LessonList,{lessons:[second],showCount:false}));
  expect(getByText('Два')).toBeTruthy();expect(queryByText('Один')).toBeNull();expect(queryByText('Всего: 1')).toBeNull();
});
