import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import BlogPost from '@/models/BlogPost';
import LottieAsset from '@/models/LottieAsset';
import Project from '@/models/Project';
import Book from '@/models/Book';
import Comment from '@/models/Comment';
import Character from '@/models/Character';
import CharacterJournal from '@/models/CharacterJournal';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });

  const users = await User.find({ deletedAt: { $exists: true } }).select('name email role deletedAt');
  const posts = await BlogPost.find({ deletedAt: { $exists: true } }).select('title slug deletedAt');
  const lotties = await LottieAsset.find({ deletedAt: { $exists: true } }).select('name fileName deletedAt');
  const projects = await Project.find({ deletedAt: { $exists: true } }).select('title slug deletedAt');
  const books = await Book.find({ deletedAt: { $exists: true } }).select('title deletedAt');
  const comments = await Comment.find({ deletedAt: { $exists: true } }).select('content postId deletedAt');
  const characters = await Character.find({ deletedAt: { $exists: true } }).select('name slug deletedAt');
  const journals = await CharacterJournal.find({ deletedAt: { $exists: true } }).select('title slug deletedAt');

  return NextResponse.json({ success: true, data: { users, posts, lotties, projects, books, comments, characters, journals } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load trash' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });

  const { type, id, action } = await request.json(); // type: 'user'|'post'|'lottie'|'project'|'book'|'comment'|'character'|'journal'|'all'
    let model: any;
    if (type === 'user') model = User;
    if (type === 'post') model = BlogPost;
    if (type === 'lottie') model = LottieAsset;
    if (type === 'project') model = Project;
    if (type === 'book') model = Book;
    if (type === 'comment') model = Comment;
    if (type === 'character') model = Character;
    if (type === 'journal') model = CharacterJournal;
  const models: Record<string, any> = { user: User, post: BlogPost, lottie: LottieAsset, project: Project, book: Book, comment: Comment, character: Character, journal: CharacterJournal };
  if (!model && action !== 'empty') return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });

    if (action === 'restore') {
      // Load the document first to check state and potential conflicts
      const existing = await model.findById(id).lean();
      if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      if (!existing.deletedAt) {
        return NextResponse.json({ success: false, error: 'Item is not in trash' }, { status: 400 });
      }

      // For slugged models, ensure unique slug among non-deleted docs
      let updateSlug: string | undefined;
      const hasSlug = ['post', 'project', 'character', 'journal'].includes(type as string) && typeof (existing as any).slug === 'string';
      if (hasSlug) {
        const baseSlug: string = (existing as any).slug;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m: any = model;
        const isTaken = async (slug: string) => !!(await m.exists({ slug, _id: { $ne: id }, deletedAt: { $exists: false } }));
        let candidate = baseSlug;
        let i = 2;
        // Only adjust if current slug collides
        if (await isTaken(candidate)) {
          while (await isTaken(candidate)) {
            candidate = `${baseSlug}-${i}`;
            i += 1;
            if (i > 200) break; // safety
          }
          updateSlug = candidate;
        }
      }

      try {
        const $set: Record<string, unknown> = {};
        if (type === 'user') $set.status = 'active';
        if (updateSlug) $set.slug = updateSlug;
        const doc = await model.findByIdAndUpdate(
          id,
          { $unset: { deletedAt: 1, deletedBy: 1 }, ...(Object.keys($set).length ? { $set } : {}) },
          { new: true }
        );
        try {
          await AuditLog.create({
            action: 'trash.restore',
            entityType: type,
            entityId: id,
            userId: me._id,
            userEmail: me.email,
            meta: { route: 'trash', model: model.modelName, slugChanged: !!updateSlug },
          });
        } catch {}
        return NextResponse.json({ success: true, message: updateSlug ? `Restored (slug updated to ${updateSlug})` : 'Restored', doc: { _id: doc?._id } });
      } catch (e: unknown) {
        // Duplicate key error safety
        if (e && typeof e === 'object' && 'code' in e && (e as any).code === 11000) {
          return NextResponse.json({ success: false, error: 'Restore blocked by unique constraint (likely slug conflict). Rename the existing item or the one being restored.' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: 'Failed to restore' }, { status: 500 });
      }
    }

    if (action === 'delete') {
      await model.findByIdAndDelete(id);
      try {
        await AuditLog.create({
          action: 'trash.delete',
          entityType: type,
          entityId: id,
          userId: me._id,
          userEmail: me.email,
          meta: { route: 'trash', model: model.modelName },
        });
      } catch {}
      return NextResponse.json({ success: true, message: 'Permanently deleted' });
    }

    if (action === 'empty') {
      const targets = (type && type !== 'all') ? [type] : Object.keys(models);
      const results: Record<string, number> = {};
      for (const t of targets) {
        const m = models[t];
        if (!m) continue;
        const res = await m.deleteMany({ deletedAt: { $exists: true } });
        results[t] = res?.deletedCount || 0;
      }
      try {
        await AuditLog.create({
          action: 'trash.empty',
          entityType: 'trash',
          entityId: 'all',
          userId: me._id,
          userEmail: me.email,
          meta: { results, type: type || 'all' },
        });
      } catch {}
      return NextResponse.json({ success: true, message: 'Trash emptied', results });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to modify trash' }, { status: 500 });
  }
}
