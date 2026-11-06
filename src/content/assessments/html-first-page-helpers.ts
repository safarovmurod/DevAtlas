// Small builders that keep the authored questions short.

/** Text in Russian, Tajik and English. */
export const t = (ru: string, tg: string, en: string) => ({ ru, tg, en });
export const option = (id: string, ru: string, tg: string, en: string) => ({
  id,
  text: t(ru, tg, en),
});
/** Fields every question shares. */
export const info = (
  id: string,
  relatedSection: number,
  critical: boolean,
  prompt: ReturnType<typeof t>,
  hint: ReturnType<typeof t>,
  explanation: ReturnType<typeof t>,
) => ({ id, relatedSection, critical, prompt, hints: [hint], explanation });
