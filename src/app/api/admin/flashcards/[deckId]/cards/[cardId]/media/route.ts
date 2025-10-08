import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import UserModel from '@/models/User';
import { createAuditLog } from '@/lib/audit-log';

/**
 * POST /api/admin/flashcards/[deckId]/cards/[cardId]/media
 * Upload media for a flashcard card
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ deckId: string; cardId: string }> }
) {
  const params = await props.params;
  await connectToDatabase();

  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const user = await UserModel.findOne({ clerkId: userId }).select('role');
    if (!user || !['editor', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Find deck by ID or slug
    const deck = await FlashcardDeckModel.findOne({
      $or: [
        Types.ObjectId.isValid(params.deckId) ? { _id: params.deckId } : { slug: params.deckId },
        { slug: params.deckId }
      ],
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Find card
    const card = await FlashcardCardModel.findOne({
      _id: new Types.ObjectId(params.cardId),
      deckId: deck._id,
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'flashcards');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${params.deckId}_${params.cardId}_${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create public URL
    const imageUrl = `/uploads/flashcards/${filename}`;

    // Update card with image URL (add to imageUrls array)
    if (!card.prompt.media) {
      card.prompt.media = {};
    }
    if (!card.prompt.media.imageUrls) {
      card.prompt.media.imageUrls = [];
    }
    card.prompt.media.imageUrls.push(imageUrl);
    await card.save();

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'update',
        resource: 'FlashcardCard',
        resourceId: card._id,
        changes: {
          before: { imageUrls: card.prompt.media?.imageUrls || [] },
          after: { imageUrls: card.prompt.media.imageUrls },
        },
      },
      request
    );

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/flashcards/[deckId]/cards/[cardId]/media
 * Delete media from a flashcard card
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ deckId: string; cardId: string }> }
) {
  const params = await props.params;
  await connectToDatabase();

  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const user = await UserModel.findOne({ clerkId: userId }).select('role');
    if (!user || !['editor', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Find deck by ID or slug
    const deck = await FlashcardDeckModel.findOne({
      $or: [
        Types.ObjectId.isValid(params.deckId) ? { _id: params.deckId } : { slug: params.deckId },
        { slug: params.deckId }
      ],
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Find card
    const card = await FlashcardCardModel.findOne({
      _id: new Types.ObjectId(params.cardId),
      deckId: deck._id,
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Remove image URL from card
    const oldImageUrls = card.prompt?.media?.imageUrls || [];
    if (card.prompt.media) {
      card.prompt.media.imageUrls = [];
    }
    await card.save();

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'update',
        resource: 'FlashcardCard',
        resourceId: card._id,
        changes: {
          before: { imageUrls: oldImageUrls },
          after: { imageUrls: [] },
        },
      },
      request
    );

    // Note: We're not deleting the physical file to prevent broken links
    // if the card is reverted. Could implement cleanup later.

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
