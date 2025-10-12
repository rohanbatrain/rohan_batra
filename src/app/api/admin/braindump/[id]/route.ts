/**
 * Braindump Detail API Routes
 * Handles individual braindump operations (GET, PUT, DELETE)
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
const updateBraindumpSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['captured', 'processed', 'archived']).optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
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
  processedInto: z.object({
    type: z.string(),
    id: z.string().optional(),
    note: z.string().max(500).optional(),
  }).optional(),
});

/**
 * GET /api/admin/braindump/[id]
 * Get a single braindump
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid braindump ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Get MongoDB user ID from Clerk ID
    const user = (await User.findOne({ clerkId }).lean()) as { _id: mongoose.Types.ObjectId } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = user._id;

    const braindump = await BraindumpModel.findOne({
      _id: id,
      userId,
    }).lean();

    if (!braindump) {
      return NextResponse.json({ error: 'Braindump not found' }, { status: 404 });
    }

    return NextResponse.json(braindump);
  } catch (error: any) {
    console.error('Error fetching braindump:', error);
    return NextResponse.json(
      { error: 'Failed to fetch braindump', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/braindump/[id]
 * Update a braindump
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid braindump ID' }, { status: 400 });
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
    const validatedData = updateBraindumpSchema.parse(body);

    // Get old braindump to compare links and visibility
    const oldBraindump = await BraindumpModel.findOne({ _id: id, userId });
    if (!oldBraindump) {
      return NextResponse.json({ error: 'Braindump not found' }, { status: 404 });
    }

    // Sanitize content if being updated
    const sanitizedContent = validatedData.content 
      ? sanitizeBraindumpContent(validatedData.content)
      : oldBraindump.content;

    // Generate or update slug if visibility changes to public/unlisted and no slug exists
    let slug = oldBraindump.slug;
    const newVisibility = validatedData.visibility || oldBraindump.visibility;
    if ((newVisibility === 'public' || newVisibility === 'unlisted') && !slug) {
      const textForSlug = sanitizedContent.substring(0, 100);
      slug = await generateSlug(textForSlug, 'braindump');
    }

    // Extract new linked IDs if content is being updated
    const newLinkedIds = validatedData.content 
      ? extractLinkedBraindumpIds(sanitizedContent)
          .filter(linkId => mongoose.Types.ObjectId.isValid(linkId))
          .map(linkId => new mongoose.Types.ObjectId(linkId))
      : (oldBraindump.linkedTo || []);
    
    // Find added and removed links
    const oldLinkedIds = (oldBraindump.linkedTo || []).map(linkId => linkId.toString());
    const newLinkedIdsStr = newLinkedIds.map(linkId => linkId.toString());
    
    const addedLinks = newLinkedIds.filter(
      linkId => !oldLinkedIds.includes(linkId.toString())
    );
    const removedLinks = (oldBraindump.linkedTo || []).filter(
      linkId => !newLinkedIdsStr.includes(linkId.toString())
    );

    // Update braindump
    const updateData: any = { ...validatedData, linkedTo: newLinkedIds };
    if (validatedData.content) {
      updateData.content = sanitizedContent;
    }
    if (slug && slug !== oldBraindump.slug) {
      updateData.slug = slug;
    }
    
    const braindump = await BraindumpModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!braindump) {
      return NextResponse.json({ error: 'Braindump not found' }, { status: 404 });
    }
    
    // Update backlinks on added links
    if (addedLinks.length > 0) {
      await BraindumpModel.updateMany(
        { _id: { $in: addedLinks }, userId },
        { $addToSet: { linkedFrom: id } }
      );
    }
    
    // Update backlinks on removed links
    if (removedLinks.length > 0) {
      await BraindumpModel.updateMany(
        { _id: { $in: removedLinks }, userId },
        { $pull: { linkedFrom: id } }
      );
    }

    return NextResponse.json(braindump);
  } catch (error: any) {
    console.error('Error updating braindump:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update braindump', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/braindump/[id]
 * Delete a braindump
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid braindump ID' }, { status: 400 });
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

    const braindump = await BraindumpModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!braindump) {
      return NextResponse.json({ error: 'Braindump not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Braindump deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting braindump:', error);
    return NextResponse.json(
      { error: 'Failed to delete braindump', details: error.message },
      { status: 500 }
    );
  }
}
