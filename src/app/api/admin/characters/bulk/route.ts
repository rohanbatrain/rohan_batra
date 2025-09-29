import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import { z } from 'zod';

const ItemSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  visibility: z.enum(['private', 'public']).optional(),
  role: z
    .enum(['protagonist', 'antagonist', 'supporting', 'minor'])
    .default('supporting'),
  significance: z.enum(['major', 'minor', 'background']).optional(),
  description: z.string().optional(),
  personality: z.string().optional(),
  background: z.string().optional(),
  physicalDescription: z.string().optional(),
  goals: z.string().optional(),
  conflicts: z.string().optional(),
  birthdate: z.string().datetime().optional(),
  age: z.number().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  avatar: z.string().url().optional(),
  bookId: z.string().optional(),
});

function computeAgeFromDate(date?: Date) {
  if (!date) return undefined;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age < 0 ? 0 : age;
}

function parseCSV(text: string): Record<string, string>[] {
  // very lightweight CSV parser: handles comma-separated with optional quotes, no newlines within fields
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (lines.length === 0) return [];
  const header = splitCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    rows.push(obj);
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map(s => s.trim().replace(/^"|"$/g, ''));
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
    if (!me || !['admin', 'editor'].includes(me.role))
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );

    const contentType = request.headers.get('content-type') || '';
    let items: Array<z.infer<typeof ItemSchema>> = [];
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!Array.isArray(body))
        return NextResponse.json(
          { success: false, error: 'Expected JSON array' },
          { status: 400 }
        );
      items = body.map(it => ItemSchema.parse(it));
    } else if (
      contentType.includes('text/csv') ||
      contentType.includes('application/csv')
    ) {
      const text = await request.text();
      const rows = parseCSV(text);
      items = rows.map(row => {
        const mapped: Record<string, unknown> = { ...row };
        if (row.tags)
          mapped.tags = row.tags
            .split('|')
            .map(t => t.trim())
            .filter(Boolean);
        if (row.featured)
          mapped.featured = row.featured.toLowerCase() === 'true';
        if (row.age) mapped.age = Number(row.age);
        return ItemSchema.parse(mapped);
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported content type' },
        { status: 415 }
      );
    }

    const docsInput = items.map(data => {
      let birthdate: Date | undefined;
      if (data.birthdate) {
        const bd = new Date(data.birthdate);
        if (!isNaN(bd.getTime())) birthdate = bd;
      }
      return {
        name: data.name,
        fullName: data.fullName,
        slug: data.slug,
        visibility: data.visibility || 'private',
        role: data.role,
        significance: data.significance || 'minor',
        description: data.description ?? '<p></p>',
        personality: data.personality ?? '<p></p>',
        background: data.background ?? '<p></p>',
        physicalDescription: data.physicalDescription,
        goals: data.goals,
        conflicts: data.conflicts,
        birthdate,
        age: birthdate ? computeAgeFromDate(birthdate) : data.age,
        tags: data.tags || [],
        featured: data.featured,
        avatar: data.avatar,
        bookId: data.bookId,
      };
    });

    const results: Array<{ index: number; id?: string; error?: string }> = [];
    for (let i = 0; i < docsInput.length; i++) {
      try {
        const doc = await Character.create(docsInput[i] as any);
        results.push({ index: i, id: doc._id.toString() });
        try {
          const AuditLog = (await import('@/models/AuditLog')).default;
          await AuditLog.create({
            action: 'character.create',
            entityType: 'Character',
            entityId: doc._id.toString(),
            userId: me._id.toString(),
            userEmail: me.email,
            meta: { bulk: true, name: doc.name, slug: doc.slug },
          });
        } catch {}
      } catch (err) {
        results.push({ index: i, error: 'Create failed' });
      }
    }

    const successCount = results.filter(r => r.id).length;
    return NextResponse.json({
      success: true,
      inserted: successCount,
      results,
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: e.issues },
        { status: 400 }
      );
    return NextResponse.json(
      { success: false, error: 'Failed to bulk import characters' },
      { status: 500 }
    );
  }
}
