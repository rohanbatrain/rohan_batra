import connectToDatabase from '@/lib/mongodb';
import TryHackMeBadgeModel from '@/models/TryHackMeBadge';
import TryHackMeRoomModel from '@/models/TryHackMeRoom';
import TryHackMeProfileModel from '@/models/TryHackMeProfile';
import { TryHackMeBadge, TryHackMeProfile, TryHackMeRoom, TryHackMeSummary } from '@/types/tryhackme';

export async function getTryHackMeSummary(limit = 6): Promise<TryHackMeSummary> {
  await connectToDatabase();
  const [profileDoc, roomDocs, badgeDocs] = await Promise.all([
    TryHackMeProfileModel.findOne({}).sort({ updatedAt: -1 }).lean().exec(),
    TryHackMeRoomModel.find({})
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(limit)
      .lean()
      .exec(),
    TryHackMeBadgeModel.find({ visibility: 'public' })
      .sort({ earnedAt: -1, updatedAt: -1 })
      .limit(limit)
      .lean()
      .exec(),
  ]);

  const profile: TryHackMeProfile | null = profileDoc
    ? {
        _id: (profileDoc as any)?._id?.toString?.(),
        username: (profileDoc as any).username,
        displayName: (profileDoc as any).displayName,
        rank: (profileDoc as any).rank,
        points: (profileDoc as any).points ?? 0,
        badgesCount: (profileDoc as any).badgesCount ?? 0,
        roomsCount: (profileDoc as any).roomsCount ?? 0,
        profileUrl: (profileDoc as any).profileUrl,
        avatarUrl: (profileDoc as any).avatarUrl,
        lastSyncedAt: (profileDoc as any).lastSyncedAt,
        createdAt: (profileDoc as any).createdAt,
        updatedAt: (profileDoc as any).updatedAt,
      }
    : null;

  const recentRooms: TryHackMeRoom[] = (roomDocs || []).map((r: any) => ({
    _id: r._id?.toString?.(),
    title: r.title,
    thmRoomId: r.thmRoomId,
    slug: r.slug,
    link: r.link,
    difficulty: r.difficulty,
    points: r.points ?? 0,
    completedAt: r.completedAt,
    tags: r.tags || [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const recentBadges: TryHackMeBadge[] = (badgeDocs || []).map((b: any) => ({
    _id: b._id?.toString?.(),
    title: b.title,
    thmBadgeId: b.thmBadgeId,
    imageUrl: b.imageUrl,
    link: b.link,
    description: b.description,
    category: b.category,
    tags: b.tags || [],
    earnedAt: b.earnedAt,
    visibility: b.visibility,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }));

  return { profile, recentRooms, recentBadges };
}
