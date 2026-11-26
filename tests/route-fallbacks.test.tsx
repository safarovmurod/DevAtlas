import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import nextConfig from '../next.config';
import GlobalError from '@/app/global-error';
import { COURSE_IDS } from '@/lib/courses/ids';
import { ERROR_COPY } from '@/lib/error-copy';
import { useLearningStore } from '@/stores/learning-store';

describe('/courses/<id> without a section', () => {
  it('redirects every real course except React to its plan, and nothing else', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const course = redirects.find((rule) => rule.source.startsWith('/courses/:courseId('));
    expect(course).toMatchObject({ destination: '/courses/:courseId/plan', permanent: false });
    // The same pattern Next.js matches: anchored, one segment, only the listed IDs.
    const ids = course!.source.slice('/courses/:courseId('.length, -1);
    const match = new RegExp(`^/courses/(${ids})$`);
    for (const id of COURSE_IDS) expect(match.test(`/courses/${id}`)).toBe(id !== 'react');
    for (const path of ['/courses/materials', '/courses/html-x', '/courses/category'])
      expect(match.test(path)).toBe(false);
  });
});

describe('global error screen', () => {
  it('renders its own document with a title, retry and home actions', () => {
    // A server render reads the store's initial language; the browser then shows the saved one.
    const language = useLearningStore.getInitialState().language;
    const markup = renderToStaticMarkup(<GlobalError error={new Error('x')} reset={() => {}} />);
    const copy = ERROR_COPY[language];
    expect(markup.startsWith(`<html lang="${language}"><head><title>${copy.title}</title>`)).toBe(
      true,
    );
    expect(markup).toContain('<body>');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain(copy.description);
    expect(markup).toContain(copy.retry);
    expect(markup).toContain(`href="/">${copy.home}</a>`);
  });
});
