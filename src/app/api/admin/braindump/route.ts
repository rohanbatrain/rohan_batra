/**
 * Braindump API Routes
 * Handles listing and creating braindumps
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import BraindumpModel from '@/models/Braindump';
import User from '@/models/User';
import { z } from 'zod';
import mongoose from 'mongoose';
import { extractLinkedBraindumpIds } from '@/lib/braindump/link-parser';
import { generateSlug } from '@/lib/slug';
import { sanitizeBraindumpContent } from '@/lib/sanitize';
import { requireCSRFToken, csrfErrorResponse } from '@/lib/csrf';

// Validation schema
const createBraindumpSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).default([]),
  category: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['captured', 'processed', 'archived']).default('captured'),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  associations: z.array(z.object({
    type: z.enum([
      'blog', 'project', 'course', 'book', 'character', 'portfolio',
      'social-post', 'linkedin', 'twitter', 'experience', 'flashcard',
      'documentation', 'other'
    ]),
    id: z.string().max(200).optional(),
    title: z.string().max(200).optional(),
    url: z.string().max(500).optional(),
    note: z.string().max(500).optional(),
  })).optional(),
});

/**
 * GET /api/admin/braindump
 * List braindumps with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get MongoDB user ID from Clerk ID
    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    // Build query with MongoDB userId (already an ObjectId)
    const query: any = { userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await BraindumpModel.countDocuments(query);

    // Get braindumps with pagination
    const braindumps = await BraindumpModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get stats
    const stats = await BraindumpModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalCaptured: {
            $sum: { $cond: [{ $eq: ['$status', 'captured'] }, 1, 0] }
          },
          totalProcessed: {
            $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] }
          },
          totalArchived: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          urgentCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          },
          highCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
        }
      }
    ]);

    return NextResponse.json({
      braindumps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        totalCaptured: 0,
        totalProcessed: 0,
        totalArchived: 0,
        urgentCount: 0,
        highCount: 0,
      }
    });
  } catch (error: any) {
    console.error('Error fetching braindumps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch braindumps', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/braindump
 * Create a new braindump
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CSRF protection
    const csrfValid = await requireCSRFToken(request);
    if (!csrfValid) {
      return csrfErrorResponse();
    }

    await connectToDatabase();

    // Get MongoDB user ID from Clerk ID
    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    const body = await request.json();
    
    // Validate input
    const validatedData = createBraindumpSchema.parse(body);
    
    console.log('[CREATE BRAINDUMP] Validated data:', {
      title: validatedData.title,
      contentLength: validatedData.content.length,
      hasTitle: !!validatedData.title
    });

    // Sanitize content
    const sanitizedContent = sanitizeBraindumpContent(validatedData.content);

    // Generate slug if visibility is public or unlisted
    let slug: string | undefined;
    if (validatedData.visibility === 'public' || validatedData.visibility === 'unlisted') {
      // Extract first meaningful text for slug generation
      const textForSlug = sanitizedContent.substring(0, 100);
      slug = await generateSlug(textForSlug, 'braindump');
    }

    // Extract linked braindump IDs from content
    const linkedBraindumpIds = extractLinkedBraindumpIds(sanitizedContent);
    const validLinkedIds = linkedBraindumpIds
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    // Create braindump with MongoDB userId (already an ObjectId)
    const braindump = new BraindumpModel({
      userId,
      title: validatedData.title,
      content: sanitizedContent,
      tags: validatedData.tags,
      category: validatedData.category || '',
      priority: validatedData.priority,
      visibility: validatedData.visibility,
      slug,
      associations: validatedData.associations,
      linkedTo: validLinkedIds,  // Store outgoing links
    });

    await braindump.save();
    
    // Update backlinks on referenced braindumps
    if (validLinkedIds.length > 0) {
      await BraindumpModel.updateMany(
        { _id: { $in: validLinkedIds }, userId },
        { $addToSet: { linkedFrom: braindump._id } }
      );
    }

    return NextResponse.json(braindump, { status: 201 });
  } catch (error: any) {
    console.error('Error creating braindump:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create braindump', details: error.message },
      { status: 500 }
    );
  }
}
