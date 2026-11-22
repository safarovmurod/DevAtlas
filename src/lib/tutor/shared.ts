export interface TutorSource {
  questionId: string;
  topicId: string;
  title: string;
  file: string;
  sourceId: string;
  href?: string;
  lessonHref?: string;
  courseId?: string;
  courseTitle?: string;
  day?: number;
  matchedQuestion?: string;
}

export interface TutorStrikeNotice {
  kind?: 'off_topic' | 'profanity';
  strikes: number;
  maxStrikes: 3 | 5;
  blocked: boolean;
  blockedUntil: string | null;
}

export interface ModerationSummary {
  offTopic: TutorStrikeNotice;
  profanity: TutorStrikeNotice;
  blocked: boolean;
  blockReason: 'profanity' | 'off_topic' | null;
  blockedUntil: string | null;
}

export interface TutorWebSource {
  title: string;
  url: string;
}

export type TutorExplainStyle = 'default' | 'simpler' | 'another_example' | 'from_zero';

export function detectExplainStyle(text: string): TutorExplainStyle {
  const value = text.trim();
  if (
    /(?:сода\s*(?:кн|кун|тар)|нафаҳмидам|нафахмидам|проще|объясни\s+проще|не\s+понял|simpler|explain\s+simply|eli5|m[aá]s\s+sencillo|no\s+entend[ií])/iu.test(
      value,
    )
  ) {
    return 'simpler';
  }
  if (
    /(?:дигар\s+мисол|мисоли\s+дигар|боз\s+мисол|мисол\s+(?:бте|биор|деҳ|кати)|другой\s+пример|ещ[её]\s+пример|на\s+другом\s+примере|another\s+example|different\s+example|otro\s+ejemplo)/iu.test(
      value,
    )
  ) {
    return 'another_example';
  }
  if (
    /(?:аз\s+(?:нол|сифр)|ай\s+(?:нол|сифр)|с\s+нуля|from\s+(?:zero|scratch)|desde\s+cero)/iu.test(
      value,
    )
  ) {
    return 'from_zero';
  }
  return 'default';
}

export function isStyleFollowUp(text: string): boolean {
  return (
    detectExplainStyle(text) !== 'default' &&
    text.trim().length <= 45 &&
    text.trim().split(/\s+/).length <= 5
  );
}

export function isDeepFollowUp(text: string): boolean {
  return (
    /^(?:ч[уқукӯ]+ур(?:тар)?\s*(?:фаҳмон|фахмон)?|глубже|подробнее|объясни подробнее|deeper|explain more|expand|más a fondo|con más detalle|explica más|profundiza)[.!?\s]*$/i.test(
      text.trim(),
    ) || /^саволи пешинаро(?:\s|$)/i.test(text.trim())
  );
}

export function wantsDeepExplanation(text: string): boolean {
  return /ч[уқукӯ]+ур|муфассал|подробн|глубже|in depth|deeper|explain more|a fondo|más detalle|en profundidad|profundiza|explica más/i.test(
    text,
  );
}
