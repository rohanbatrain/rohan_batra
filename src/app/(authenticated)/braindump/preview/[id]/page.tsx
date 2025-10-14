/**
 * Authenticated Braindump Preview Page
 * Allows owners to preview their braindumps in any visibility mode
 * Access: /braindump/preview/[id]
 */

import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';
import BraindumpComment from '@/models/BraindumpComment';
import BraindumpReaction from '@/models/BraindumpReaction';
import User from '@/models/User';
import BraindumpPublicView from '@/components/braindump/BraindumpPublicView';
import PreviewBanner from '@/components/braindump/PreviewBanner';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BraindumpPreviewPage({ params }: Props) {
  const { id } = await params;
  
  // Require authentication
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect('/sign-in?redirect=/braindump/preview/' + id);
  }

  await connectToDatabase();

  // Get MongoDB user ID
  const user = await User.findOne({ clerkId }).lean() as { _id: any } | null;
  if (!user) {
    redirect('/sign-in');
  }

  // Find braindump - owner can preview ANY visibility
  const braindump = await Braindump.findOne({
    _id: id,
    userId: user._id,
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

  const visibility = (braindump.visibility || 'private') as 'private' | 'unlisted' | 'public';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PreviewBanner 
        visibility={visibility} 
        braindump={{
          slug: braindump.slug,
          updatedAt: braindump.updatedAt.toISOString(),
          content: braindump.content,
          tags: braindump.tags,
        }} 
      />
      
      {/* Main Content with Animation */}
      <div className="animate-in fade-in duration-500">
        <BraindumpPublicView braindump={braindumpData} />
      </div>
    </div>
  );
}
