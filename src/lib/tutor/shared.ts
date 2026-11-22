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
  strikes: number;
  maxStrikes: 3;
  blocked: boolean;
  blockedUntil: string | null;
}

export interface TutorWebSource {
  title: string;
  url: string;
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
