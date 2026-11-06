'use client';
import Link from 'next/link';
import { coursePublishedDays, courseTrack, type LearningStage } from '@/content/courses/catalog';
import { courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { STAGE_LABELS, TRACK_LABEL, UNPUBLISHED_STAGE } from './course-workspace-copy';

const STAGES: LearningStage[] = ['beginner', 'pro', 'expert'];
const STAGE_NAMES: Record<LearningStage, string> = {
  beginner: 'Beginner',
  pro: 'Pro',
  expert: 'Expert',
};

/** Beginner → Pro → Expert steps of the course's learning track. */
export function TrackStages({
  courseId,
  language,
}: {
  courseId: ImportedCourseId;
  language: InterfaceLocale;
}) {
  const track = courseTrack(courseId);
  if (!track) return null;

  return (
    <nav className="track-stages" aria-label={TRACK_LABEL[language]}>
      {STAGES.map((stage) => {
        const published = track.courses.filter((entry) => entry.stage === stage);
        const isHere = published.some((entry) => entry.course === courseId);
        const stageLabel = STAGE_LABELS[stage][language];

        return (
          <div key={stage} className={'track-stage ' + (isHere ? 'is-here' : '')}>
            <strong>{STAGE_NAMES[stage]}</strong>
            {published.length ? (
              <>
                {published.map((entry) => (
                  <Link
                    key={entry.course}
                    href={`/courses/${entry.course}/plan`}
                    aria-current={entry.course === courseId ? 'location' : undefined}
                  >
                    {courseDisplayName(entry.course, language)} ·{' '}
                    {courseDayCount(coursePublishedDays(entry.course), language)}
                  </Link>
                ))}
                <small>{stageLabel}</small>
              </>
            ) : (
              <span className="track-stage-pending">
                {stageLabel} — {UNPUBLISHED_STAGE[language]}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

const JAVASCRIPT_MONTHS = ['javascript-1', 'javascript-2'] as const;

/** JavaScript is taught as two monthly courses; this switches between them. */
export function JavaScriptMonths({
  courseId,
  language,
}: {
  courseId: ImportedCourseId;
  language: InterfaceLocale;
}) {
  if (courseId !== 'javascript-1' && courseId !== 'javascript-2') return null;
  const ui = LEARNING_UI_COPY[language];

  return (
    <nav className="course-months" aria-label={ui.jsMonths}>
      {JAVASCRIPT_MONTHS.map((id, index) => (
        <Link
          key={id}
          href={`/courses/${id}/plan`}
          aria-current={id === courseId ? 'page' : undefined}
        >
          <strong>
            {ui.month} {index + 1} · JS{index + 1}
          </strong>
          <span>{index === 0 ? ui.jsBasics : ui.jsApps}</span>
        </Link>
      ))}
    </nav>
  );
}
