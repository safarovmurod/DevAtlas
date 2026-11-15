import type { CSSProperties } from 'react';
import Image from 'next/image';
import type { CourseId } from '@/lib/courses/ids';
import { cn } from '@/lib/utils';

/**
 * Course logo from public/course-icons. Technology logos come from Devicon
 * (MIT) and subject symbols from Lucide (ISC); see ATTRIBUTION.md there.
 * The image is decorative: the course name is always shown next to it.
 *
 * `shared` gives the logo a view-transition name, so the logo on a catalog
 * card flies into the course page header during navigation.
 */
export function CourseIcon({
  courseId,
  size = 48,
  className,
  shared = false,
}: {
  courseId: CourseId;
  size?: number;
  className?: string;
  shared?: boolean;
}) {
  const style = shared
    ? ({ viewTransitionName: `course-logo-${courseId}` } as CSSProperties)
    : undefined;
  return (
    <Image
      src={`/course-icons/${courseId}.svg`}
      alt=""
      width={size}
      height={size}
      unoptimized
      style={style}
      className={cn('shrink-0 rounded-xl', className)}
    />
  );
}
