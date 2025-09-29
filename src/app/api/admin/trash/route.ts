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
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'Auth required' },
        { status: 401 }
      );
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin')
      return NextResponse.json(
        { success: false, error: 'Admin only' },
        { status: 403 }
      );

    const users = await User.find({ deletedAt: { $exists: true } }).select(
      'name email role deletedAt'
    );
    const posts = await BlogPost.find({ deletedAt: { $exists: true } }).select(
      'title slug deletedAt'
    );
    const lotties = await LottieAsset.find({
      deletedAt: { $exists: true },
    }).select('name fileName deletedAt');
    const projects = await Project.find({
      deletedAt: { $exists: true },
    }).select('title slug deletedAt');
    const books = await Book.find({ deletedAt: { $exists: true } }).select(
      'title deletedAt'
    );
    const comments = await Comment.find({
      deletedAt: { $exists: true },
    }).select('content postId deletedAt');
    const characters = await Character.find({
      deletedAt: { $exists: true },
    }).select('name slug deletedAt');
    const journals = await CharacterJournal.find({
      deletedAt: { $exists: true },
    }).select('title slug deletedAt');

    return NextResponse.json({
      success: true,
      data: {
        users,
        posts,
        lotties,
        projects,
        books,
        comments,
        characters,
        journals,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to load trash' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'Auth required' },
        { status: 401 }
      );
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin')
      return NextResponse.json(
        { success: false, error: 'Admin only' },
        { status: 403 }
      );

    const body = await request.json(); // type: 'user'|'post'|'lottie'|'project'|'book'|'comment'|'character'|'journal'|'all'
    const { type, id, ids, action } = body as {
      type?: string;
      id?: string;
      ids?: string[];
      action?: string;
    };
    let model: any;
    if (type === 'user') model = User;
    if (type === 'post') model = BlogPost;
    if (type === 'lottie') model = LottieAsset;
    if (type === 'project') model = Project;
    if (type === 'book') model = Book;
    if (type === 'comment') model = Comment;
    if (type === 'character') model = Character;
    if (type === 'journal') model = CharacterJournal;
    const models: Record<string, any> = {
      user: User,
      post: BlogPost,
      lottie: LottieAsset,
      project: Project,
      book: Book,
      comment: Comment,
      character: Character,
      journal: CharacterJournal,
    };
    if (!model && action !== 'empty')
      return NextResponse.json(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );

    if (action === 'restore') {
      // Bulk restore when ids array provided
      if (Array.isArray(ids) && ids.length > 0) {
        // Try to run a transaction for stronger atomicity. If transactions are not supported
        // (standalone MongoDB), fall back to sequential processing.
        let session: mongoose.ClientSession | null = null;
        const results: Array<{
          id: string;
          success: boolean;
          message?: string;
        }> = [];
        try {
          session = await mongoose.startSession();
          session.startTransaction();

          for (const oneId of ids) {
            try {
              const existing = await model
                .findById(oneId)
                .session(session)
                .lean();
              if (!existing) {
                results.push({
                  id: oneId,
                  success: false,
                  message: 'Not found',
                });
                continue;
              }
              if (!existing.deletedAt) {
                results.push({
                  id: oneId,
                  success: false,
                  message: 'Item is not in trash',
                });
                continue;
              }

              let updateSlug: string | undefined;
              const hasSlug =
                ['post', 'project', 'character', 'journal'].includes(
                  type as string
                ) && typeof (existing as any).slug === 'string';
              if (hasSlug) {
                const baseSlug: string = (existing as any).slug;

                const m: any = model;
                const isTaken = async (slug: string) =>
                  !!(await m
                    .exists({
                      slug,
                      _id: { $ne: oneId },
                      deletedAt: { $exists: false },
                    })
                    .session(session));
                let candidate = baseSlug;
                let i = 2;
                if (await isTaken(candidate)) {
                  while (await isTaken(candidate)) {
                    candidate = `${baseSlug}-${i}`;
                    i += 1;
                    if (i > 200) break;
                  }
                  updateSlug = candidate;
                }
              }

              const $set: Record<string, unknown> = {};
              if (type === 'user') $set.status = 'active';
              if (updateSlug) $set.slug = updateSlug;

              const doc = await model.findByIdAndUpdate(
                oneId,
                {
                  $unset: { deletedAt: 1, deletedBy: 1 },
                  ...(Object.keys($set).length ? { $set } : {}),
                },
                { new: true, session }
              );

              try {
                await AuditLog.create(
                  [
                    {
                      action: 'trash.restore',
                      entityType: type,
                      entityId: oneId,
                      userId: me._id,
                      userEmail: me.email,
                      meta: {
                        route: 'trash',
                        model: model.modelName,
                        slugChanged: !!updateSlug,
                      },
                    },
                  ],
                  { session }
                );
              } catch {}

              results.push({
                id: oneId,
                success: true,
                message: updateSlug
                  ? `Restored (slug updated to ${updateSlug})`
                  : 'Restored',
              });
            } catch (e) {
              results.push({
                id: oneId,
                success: false,
                message: 'Failed to restore',
              });
            }
          }

          await session.commitTransaction();
          session.endSession();
          return NextResponse.json({ success: true, results });
        } catch (txErr) {
          // If transactions are not supported or fail, fallback to sequential processing
          if (session) {
            try {
              await session.abortTransaction();
            } catch {}
            session.endSession();
          }
          // fallback: sequential processing
          for (const oneId of ids) {
            try {
              const existing = await model.findById(oneId).lean();
              if (!existing) {
                results.push({
                  id: oneId,
                  success: false,
                  message: 'Not found',
                });
                continue;
              }
              if (!existing.deletedAt) {
                results.push({
                  id: oneId,
                  success: false,
                  message: 'Item is not in trash',
                });
                continue;
              }

              let updateSlug: string | undefined;
              const hasSlug =
                ['post', 'project', 'character', 'journal'].includes(
                  type as string
                ) && typeof (existing as any).slug === 'string';
              if (hasSlug) {
                const baseSlug: string = (existing as any).slug;

                const m: any = model;
                const isTaken = async (slug: string) =>
                  !!(await m.exists({
                    slug,
                    _id: { $ne: oneId },
                    deletedAt: { $exists: false },
                  }));
                let candidate = baseSlug;
                let i = 2;
                if (await isTaken(candidate)) {
                  while (await isTaken(candidate)) {
                    candidate = `${baseSlug}-${i}`;
                    i += 1;
                    if (i > 200) break;
                  }
                  updateSlug = candidate;
                }
              }

              const $set: Record<string, unknown> = {};
              if (type === 'user') $set.status = 'active';
              if (updateSlug) $set.slug = updateSlug;

              const doc = await model.findByIdAndUpdate(
                oneId,
                {
                  $unset: { deletedAt: 1, deletedBy: 1 },
                  ...(Object.keys($set).length ? { $set } : {}),
                },
                { new: true }
              );

              try {
                await AuditLog.create({
                  action: 'trash.restore',
                  entityType: type,
                  entityId: oneId,
                  userId: me._id,
                  userEmail: me.email,
                  meta: {
                    route: 'trash',
                    model: model.modelName,
                    slugChanged: !!updateSlug,
                  },
                });
              } catch {}

              results.push({
                id: oneId,
                success: true,
                message: updateSlug
                  ? `Restored (slug updated to ${updateSlug})`
                  : 'Restored',
              });
            } catch (e) {
              results.push({
                id: oneId,
                success: false,
                message: 'Failed to restore',
              });
            }
          }

          return NextResponse.json({ success: true, results });
        }
      }
      // Load the document first to check state and potential conflicts
      const existing = await model.findById(id).lean();
      if (!existing)
        return NextResponse.json(
          { success: false, error: 'Not found' },
          { status: 404 }
        );
      if (!existing.deletedAt) {
        return NextResponse.json(
          { success: false, error: 'Item is not in trash' },
          { status: 400 }
        );
      }

      // For slugged models, ensure unique slug among non-deleted docs
      let updateSlug: string | undefined;
      const hasSlug =
        ['post', 'project', 'character', 'journal'].includes(type as string) &&
        typeof (existing as any).slug === 'string';
      if (hasSlug) {
        const baseSlug: string = (existing as any).slug;

        const m: any = model;
        const isTaken = async (slug: string) =>
          !!(await m.exists({
            slug,
            _id: { $ne: id },
            deletedAt: { $exists: false },
          }));
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
        // Duplicate key error safety
        // fallthrough for single-id path handled below
      } catch (e: unknown) {
        // Duplicate key error safety
        if (
          e &&
          typeof e === 'object' &&
          'code' in e &&
          (e as any).code === 11000
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Restore blocked by unique constraint (likely slug conflict). Rename the existing item or the one being restored.',
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { success: false, error: 'Failed to restore' },
          { status: 500 }
        );
      }
    }

    if (action === 'delete') {
      // Bulk delete when ids array provided
      if (Array.isArray(ids) && ids.length > 0) {
        const results: Array<{
          id: string;
          success: boolean;
          message?: string;
        }> = [];
        for (const oneId of ids) {
          try {
            await model.findByIdAndDelete(oneId);
            try {
              await AuditLog.create({
                action: 'trash.delete',
                entityType: type,
                entityId: oneId,
                userId: me._id,
                userEmail: me.email,
                meta: { route: 'trash', model: model.modelName },
              });
            } catch {}
            results.push({
              id: oneId,
              success: true,
              message: 'Permanently deleted',
            });
          } catch (e) {
            results.push({
              id: oneId,
              success: false,
              message: 'Failed to delete',
            });
          }
        }
        return NextResponse.json({ success: true, results });
      }

      // single delete path
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
      return NextResponse.json({
        success: true,
        message: 'Permanently deleted',
      });
    }

    if (action === 'empty') {
      const targets = type && type !== 'all' ? [type] : Object.keys(models);
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
      return NextResponse.json({
        success: true,
        message: 'Trash emptied',
        results,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to modify trash' },
      { status: 500 }
    );
  }
}
