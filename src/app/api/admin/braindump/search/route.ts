import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BraindumpModel from '@/models/Braindump';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/admin/braindump/search
 * Quick search for autocomplete (returns compact results)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    
    if (!query.trim()) {
      // Return recent braindumps if no query
      const recent = await BraindumpModel.find({ userId })
        .select('_id content tags createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      return NextResponse.json({
        results: recent.map(b => ({
          _id: b._id,
          preview: b.content.slice(0, 100),
          createdAt: b.createdAt,
        })),
      });
    }
    
    // Search by content
    const results = await BraindumpModel.find({
      userId,
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    })
      .select('_id content tags category createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      results: results.map(b => ({
        _id: b._id,
        preview: b.content.slice(0, 100),
        tags: b.tags,
        category: b.category,
        createdAt: b.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Braindump search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}
