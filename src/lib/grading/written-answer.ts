/** Match published answers without treating a shared keyword as understanding. */
export function matchesWrittenAnswer(
  input: string,
  accepted: readonly (string | undefined)[],
  caseSensitive = false,
) {
  const clean = (value: string) =>
    value
      .normalize('NFC')
      .trim()
      .replace(/^`([^`]+)`$/u, '$1')
      .trim();
  const draft = clean(input);
  if (!draft) return false;

  const prose = (value: string) =>
    value
      .replace(/(?<=\p{L})[.!?]$/u, '')
      .replace(/\s+/gu, ' ')
      .toLowerCase();
  return accepted.some((answer) => {
    if (!answer) return false;
    const expected = clean(answer);
    return caseSensitive ? draft === expected : prose(draft) === prose(expected);
  });
}
