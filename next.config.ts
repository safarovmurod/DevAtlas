import type { NextConfig } from "next";
import { COURSE_IDS } from './src/lib/courses/ids';
const storedCourseRelease = Boolean(process.env.DEVATLAS_COURSE_RELEASE?.trim());
const localCourses = './src/content/courses/*.json';
const localDownloads = './content/course-files/**/*';
const localPracticeLibrary = './content/practice-local-global.html';

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(storedCourseRelease
    ? { outputFileTracingExcludes: { '/*': [localCourses, localDownloads, localPracticeLibrary] } }
    : {
        outputFileTracingIncludes: {
          '/api/courses/*': [localCourses],
          '/api/tutor': [localCourses],
          '/courses/*': [localCourses],
          '/tests': [localCourses],
          '/course-files/*': [localCourses, localDownloads],
          '/api/practice/react-library': [localPracticeLibrary],
        },
      }),
  async redirects() {
    // /courses/<id> has no screen of its own: open the course plan (React has its own page).
    // Matching only real IDs keeps an HTTP 404 for every other /courses/<name>.
    const courseIds = COURSE_IDS.filter((id) => id !== 'react').join('|');
    return [
      { source: '/practice-local-global.html', destination: '/courses/react/practice-library?view=full', permanent: false },
      { source: `/courses/:courseId(${courseIds})`, destination: '/courses/:courseId/plan', permanent: false },
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }, {
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    }, {
      source: '/answers/export',
      headers: [{ key: 'Content-Security-Policy', value: "sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" }],
    }, {
      source: '/course-files/:path*',
      headers: [{ key: 'Content-Security-Policy', value: "sandbox; default-src 'none'" }],
    }];
  },
};
export default nextConfig;
