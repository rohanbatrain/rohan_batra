const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rohanbatra.dev';

export function generateCourseStructuredData(course: {
  title: string;
  summary?: string | null;
  slug: string;
  providerName?: string;
  image?: string | null;
  tags?: string[];
}) {
  const url = `${SITE_URL}/courses/${course.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary || undefined,
    url,
    provider: {
      '@type': 'Organization',
      name: course.providerName || 'Rohan Batra',
      sameAs: SITE_URL,
    },
    ...(course.image && {
      image: `${SITE_URL}${course.image}`,
    }),
    ...(course.tags && course.tags.length ? { keywords: course.tags.join(', ') } : {}),
  } as const;
}
