import { Metadata } from 'next';
import { ExperienceService } from '@/lib/services/experience-service';
import ExperienceTimeline from '@/components/experience/ExperienceTimeline';
import { calculateTotalYears } from '@/lib/utils/experience-utils';

export const metadata: Metadata = {
  title: 'Professional Experience | Rohan Batra',
  description:
    'Explore my professional journey, work experience, and career highlights across various roles in software engineering and development.',
  keywords: [
    'professional experience',
    'work history',
    'career',
    'software engineer',
    'developer',
    'portfolio',
  ],
  authors: [{ name: 'Rohan Batra' }],
  openGraph: {
    title: 'Professional Experience | Rohan Batra',
    description:
      'Explore my professional journey, work experience, and career highlights across various roles in software engineering and development.',
    type: 'profile',
    url: '/experience',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Experience | Rohan Batra',
    description:
      'Explore my professional journey, work experience, and career highlights.',
    creator: '@rohanbatra',
  },
  alternates: {
    canonical: '/experience',
  },
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function ExperiencePage() {
  const experiences = await ExperienceService.getPublished();
  const totalYears = calculateTotalYears(experiences);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: 'Rohan Batra',
      jobTitle: experiences[0]?.title || 'Software Engineer',
      worksFor: experiences[0]?.company
        ? {
            '@type': 'Organization',
            name: experiences[0].company,
          }
        : undefined,
      workExperience: experiences.map(exp => ({
        '@type': 'WorkExperience',
        jobTitle: exp.title,
        employer: {
          '@type': 'Organization',
          name: exp.company,
          url: exp.companyWebsite,
        },
        startDate: exp.startDate,
        endDate: exp.endDate || undefined,
        employmentType: exp.employmentType,
        location: exp.location,
        description: exp.description.replace(/<[^>]*>/g, '').slice(0, 200),
      })),
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className='min-h-screen bg-background'>
        {/* Hero Section */}
        <section className='border-b bg-gradient-to-b from-muted/50 to-background py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='mx-auto max-w-3xl text-center'>
              <h1 className='mb-4 text-4xl font-bold tracking-tight text-foreground dark:text-white md:text-5xl lg:text-6xl'>
                Professional Experience
              </h1>
              <p className='text-lg text-muted-foreground dark:text-gray-400 md:text-xl'>
                {experiences.length > 0
                  ? `${totalYears}+ years of professional experience across ${experiences.length} positions`
                  : 'Building my professional journey'}
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='mx-auto max-w-4xl'>
              <ExperienceTimeline experiences={experiences} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
