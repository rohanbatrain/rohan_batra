import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import UserModel from '@/models/User';

/**
 * GET /api/admin/flashcards/[deckId]/cards/export?format=json|csv
 * Export flashcard cards
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ deckId: string }> }
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

    // Get format from query params
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Use json or csv' }, { status: 400 });
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

    // Get all cards for this deck, sorted by order
    const cards = await FlashcardCardModel.find({ deckId: deck._id })
      .sort({ order: 1 })
      .lean();

    if (format === 'json') {
      // Export as JSON
      const jsonData = {
        deck: {
          id: deck._id.toString(),
          title: deck.title,
          slug: deck.slug,
          description: deck.description,
          exportedAt: new Date().toISOString(),
        },
        cards: cards.map(card => ({
          order: card.order,
          type: card.type,
          prompt: card.prompt,
          response: card.response,
          hint: card.hint,
          explanation: card.explanation,
          tags: card.tags,
        })),
      };

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${deck.slug}-cards.json"`,
        },
      });
    } else {
      // Export as CSV
      const stripHtml = (html: string | null | undefined) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').replace(/"/g, '""');
      };

      const csvRows = [
        // Header
        'Order,Type,Prompt,Response,Hint,Explanation,Tags',
        // Data rows
        ...cards.map(card => {
          const prompt = stripHtml(card.prompt?.text || card.prompt?.richText);
          const response = stripHtml(card.response?.text || card.response?.richText);
          const hint = stripHtml(card.hint);
          const explanation = stripHtml(card.explanation);
          const tags = (card.tags || []).join('; ');

          return [
            card.order,
            card.type,
            `"${prompt}"`,
            `"${response}"`,
            `"${hint}"`,
            `"${explanation}"`,
            `"${tags}"`,
          ].join(',');
        }),
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${deck.slug}-cards.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting cards:', error);
    return NextResponse.json({ error: 'Failed to export cards' }, { status: 500 });
  }
}
