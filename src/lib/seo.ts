import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

const defaultMetadata = {
  siteName: 'Rohan Batra Portfolio',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://rohanbatra.dev',
  defaultImage: '/images/og-default.jpg',
  author: 'Rohan Batra',
  twitter: '@rohan_batra',
};

export function generateMetadata({
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
}: SEOConfig): Metadata {
  const fullTitle = title.includes(defaultMetadata.siteName)
    ? title
    : `${title} | ${defaultMetadata.siteName}`;

  const fullUrl = url
    ? `${defaultMetadata.siteUrl}${url}`
    : defaultMetadata.siteUrl;
  const ogImage = image
    ? `${defaultMetadata.siteUrl}${image}`
    : `${defaultMetadata.siteUrl}${defaultMetadata.defaultImage}`;

  return {
    title: fullTitle,
    description,
    authors: [{ name: author || defaultMetadata.author }],
    keywords: tags,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: defaultMetadata.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: [author || defaultMetadata.author],
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: defaultMetadata.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export function generateBlogPostMetadata({
  title,
  excerpt,
  slug,
  publishedAt,
  updatedAt,
  author,
  tags,
  featuredImage,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt?: Date;
  updatedAt?: Date;
  author?: string;
  tags?: string[];
  featuredImage?: string;
}): Metadata {
  return generateMetadata({
    title,
    description: excerpt,
    url: `/blog/${slug}`,
    image: featuredImage,
    type: 'article',
    publishedTime: publishedAt?.toISOString(),
    modifiedTime: updatedAt?.toISOString(),
    author,
    tags,
  });
}

export function generateProjectMetadata({
  title,
  description,
  slug,
  technologies,
  featuredImage,
}: {
  title: string;
  description: string;
  slug: string;
  technologies?: string[];
  featuredImage?: string;
}): Metadata {
  return generateMetadata({
    title,
    description,
    url: `/portfolio/${slug}`,
    image: featuredImage,
    type: 'website',
    tags: technologies,
  });
}

// JSON-LD structured data generators
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultMetadata.siteName,
    url: defaultMetadata.siteUrl,
    description:
      'Personal portfolio and blog of Rohan Batra, showcasing projects and insights in software development.',
    author: {
      '@type': 'Person',
      name: defaultMetadata.author,
    },
    sameAs: [
      'https://github.com/rohanbatra',
      'https://linkedin.com/in/rohanbatra',
      'https://twitter.com/rohan_batra',
    ],
  };
}

export function generateBlogPostStructuredData({
  title,
  excerpt,
  slug,
  publishedAt,
  updatedAt,
  author,
  featuredImage,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt?: Date;
  updatedAt?: Date;
  author?: string;
  featuredImage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt,
    url: `${defaultMetadata.siteUrl}/blog/${slug}`,
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: author || defaultMetadata.author,
    },
    publisher: {
      '@type': 'Organization',
      name: defaultMetadata.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultMetadata.siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${defaultMetadata.siteUrl}/blog/${slug}`,
    },
    ...(featuredImage && {
      image: {
        '@type': 'ImageObject',
        url: `${defaultMetadata.siteUrl}${featuredImage}`,
        width: 1200,
        height: 630,
      },
    }),
  };
}

export function generateProjectStructuredData({
  title,
  description,
  slug,
  technologies,
  startDate,
  endDate,
  url,
  githubUrl,
}: {
  title: string;
  description: string;
  slug: string;
  technologies?: string[];
  startDate?: Date;
  endDate?: Date;
  url?: string;
  githubUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url: `${defaultMetadata.siteUrl}/portfolio/${slug}`,
    creator: {
      '@type': 'Person',
      name: defaultMetadata.author,
    },
    dateCreated: startDate?.toISOString(),
    dateModified: endDate?.toISOString(),
    ...(technologies && {
      keywords: technologies.join(', '),
    }),
    ...(url && {
      sameAs: [url],
    }),
    ...(githubUrl && {
      codeRepository: githubUrl,
    }),
  };
}
