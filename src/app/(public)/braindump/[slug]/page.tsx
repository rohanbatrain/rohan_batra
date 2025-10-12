import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';
import BraindumpComment from '@/models/BraindumpComment';
import BraindumpReaction from '@/models/BraindumpReaction';
import BraindumpPublicView from '@/components/braindump/BraindumpPublicView';

// ISR: Revalidate every hour
export const revalidate = 3600;

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  await connectToDatabase();
  
  const braindump = await Braindump.findOne({
    $or: [
      { slug },
      { _id: slug },
    ],
    visibility: { $in: ['public', 'unlisted'] },
  }).lean();

  if (!braindump) {
    return {
      title: 'Braindump Not Found',
    };
  }

  const contentPreview = braindump.content.substring(0, 160);

  return {
    title: `${contentPreview.substring(0, 60)}... | Braindumps`,
    description: braindump.publicMetadata?.ogDescription || contentPreview,
    openGraph: {
      title: contentPreview.substring(0, 60),
      description: braindump.publicMetadata?.ogDescription || contentPreview,
      images: braindump.publicMetadata?.ogImage ? [braindump.publicMetadata.ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: contentPreview.substring(0, 60),
      description: braindump.publicMetadata?.ogDescription || contentPreview,
      images: braindump.publicMetadata?.ogImage ? [braindump.publicMetadata.ogImage] : undefined,
    },
  };
}

export default async function BraindumpDetailPage({ params }: Props) {
  const { slug } = await params;
  
  await connectToDatabase();

  // Find braindump by slug or ID
  const braindump = await Braindump.findOne({
    $or: [
      { slug },
      { _id: slug },
    ],
    visibility: { $in: ['public', 'unlisted'] },
  }).lean();

  if (!braindump) {
    notFound();
  }

  // Get comment count
  const commentCount = await BraindumpComment.countDocuments({
    braindumpId: braindump._id,
    status: { $in: ['approved', 'pending'] },
  });

  // Get reaction counts
  const reactionCounts = {
    '👍': 0,
    '❤️': 0,
    '🎯': 0,
    '💡': 0,
    '🔥': 0,
  };

  try {
    const reactions = await BraindumpReaction.aggregate([
      { $match: { braindumpId: braindump._id } },
      { $group: { _id: '$emoji', count: { $sum: 1 } } },
    ]);

    reactions.forEach((r) => {
      reactionCounts[r._id as keyof typeof reactionCounts] = r.count;
    });
  } catch (err) {
    console.error('Failed to load reaction counts:', err);
  }

  // Convert to plain object for client component
  const braindumpData = {
    id: braindump._id.toString(),
    content: braindump.content,
    slug: braindump.slug,
    tags: braindump.tags,
    category: braindump.category,
    visibility: braindump.visibility,
    createdAt: braindump.createdAt.toISOString(),
    updatedAt: braindump.updatedAt.toISOString(),
    publicMetadata: {
      viewCount: braindump.publicMetadata?.viewCount || 0,
      shareCount: braindump.publicMetadata?.shareCount || 0,
      sharesByPlatform: braindump.publicMetadata?.sharesByPlatform,
    },
    commentCount,
    reactionCounts,
  };

  return <BraindumpPublicView braindump={braindumpData} />;
}
