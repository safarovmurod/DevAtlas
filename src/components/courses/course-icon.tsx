import Image from 'next/image';
import type { CourseId } from '@/lib/courses/ids';
import { cn } from '@/lib/utils';

/**
 * Course logo from public/course-icons. Technology logos come from Devicon
 * (MIT) and subject symbols from Lucide (ISC); see ATTRIBUTION.md there.
 * The image is decorative: the course name is always shown next to it.
 */
export function CourseIcon({
  courseId,
  size = 48,
  className,
}: {
  courseId: CourseId;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/course-icons/${courseId}.svg`}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn('shrink-0 rounded-xl', className)}
    />
  );
}
