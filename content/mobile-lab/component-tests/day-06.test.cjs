// Checks rendered React structure under a mock host, never device behavior.
const React = require('react');
const { render } = require('@testing-library/react-native');
const App = require('../App').default;
test('two changed greetings and a separate goal are rendered', async () => {
  const { toJSON } = await render(React.createElement(App));
  const texts = [];
  function collect(node) {
    if (node == null) return;
    if (Array.isArray(node)) { node.forEach(collect); return; }
    if (typeof node !== 'object') return;
    if (node.type === 'Text') {
      const text = (node.children ?? []).filter(child => typeof child === 'string').join('').trim();
      if (text) texts.push(text);
      return;
    }
    (node.children ?? []).forEach(collect);
  }
  collect(toJSON());
  expect(texts.length).toBeGreaterThanOrEqual(3);
  const repeated = texts.find(text => text !== 'Добро пожаловать!' && texts.filter(other => other === text).length >= 2);
  expect(repeated).toBeDefined();
  expect(texts.some(text => text !== repeated)).toBe(true);
});
