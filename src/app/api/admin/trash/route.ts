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

  const { type, id, action } = await request.json(); // type: 'user'|'post'|'lottie'|'project'|'book'|'comment'|'character'|'journal'
    let model: any;
    if (type === 'user') model = User;
    if (type === 'post') model = BlogPost;
    if (type === 'lottie') model = LottieAsset;
    if (type === 'project') model = Project;
    if (type === 'book') model = Book;
    if (type === 'comment') model = Comment;
    if (type === 'character') model = Character;
    if (type === 'journal') model = CharacterJournal;
    if (!model) return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });

    if (action === 'restore') {
      const doc = await model.findByIdAndUpdate(id, { $unset: { deletedAt: 1, deletedBy: 1 }, status: type === 'user' ? 'active' : undefined }, { new: true });
      return NextResponse.json({ success: true, message: 'Restored', doc: { _id: doc?._id } });
    }

    if (action === 'delete') {
      await model.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Permanently deleted' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to modify trash' }, { status: 500 });
  }
}
