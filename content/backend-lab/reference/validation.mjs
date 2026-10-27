export function calculateTotal(price, quantity) {
  if (!Number.isFinite(price) || !Number.isInteger(quantity) || price < 0 || quantity < 0) {
    throw new TypeError('Invalid price or quantity');
  }
  const total = price * quantity;
  if (!Number.isFinite(total)) throw new TypeError('Total overflow');
  return total;
}
export function taskInput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => key !== 'title') ||
      typeof value.title !== 'string' || !value.title.trim() || value.title.trim().length > 120) {
    throw Object.assign(new Error('Expected only a title of 1–120 characters'), {status: 422});
  }
  return {title: value.title.trim()};
}
export function positiveId(value) {
  if (!/^[1-9]\d{0,14}$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
export function pagination(params) {
  const read = (name, fallback, maximum) => {
    const values = params.getAll(name);
    if (!values.length) return fallback;
    if (values.length !== 1 || !/^\d{1,6}$/.test(values[0])) throw Object.assign(new Error('Invalid pagination'), {status: 400});
    const number = Number(values[0]);
    if (number > maximum || (name === 'limit' && number === 0)) throw Object.assign(new Error('Invalid pagination'), {status: 400});
    return number;
  };
  return {limit: read('limit', 10, 50), offset: read('offset', 0, 100000)};
}
