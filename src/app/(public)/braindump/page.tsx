import { Metadata } from 'next';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import connectToDatabase from '@/lib/mongodb';
import Braindump from '@/models/Braindump';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Eye, MessageSquare } from 'lucide-react';

// ISR: Revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Public Braindumps | Rohan Batra',
  description: 'Browse public braindumps, quick thoughts, and ideas',
  openGraph: {
    title: 'Public Braindumps',
    description: 'Browse public braindumps, quick thoughts, and ideas',
  },
};

type SearchParams = Promise<{
  search?: string;
  tag?: string;
  page?: string;
}>;

export default async function BraindumpListingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const tag = params.tag || '';
  const page = parseInt(params.page || '1');
  const limit = 20;

  await connectToDatabase();

  // Build query
  const query: any = {
    visibility: { $in: ['public', 'unlisted'] },
  };

  if (search) {
    query.$text = { $search: search };
  }

  if (tag) {
    query.tags = tag;
  }

  // Get braindumps
  const [braindumps, total] = await Promise.all([
    Braindump.find(query)
      .select('content slug tags visibility publicMetadata createdAt')
      .sort({ 'publicMetadata.viewCount': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Braindump.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Get popular tags
  const popularTags = await Braindump.aggregate([
    {
      $match: {
        visibility: { $in: ['public', 'unlisted'] },
      },
    },
    {
      $unwind: '$tags',
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Public Braindumps</h1>
        <p className="text-muted-foreground">
          Quick thoughts, ideas, and notes shared publicly
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form action="/braindump" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Search braindumps..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Popular tags:</span>
          {popularTags.map((tagData) => (
            <Link
              key={tagData._id}
              href={`/braindump?tag=${tagData._id}`}
            >
              <Badge variant={tag === tagData._id ? 'default' : 'secondary'}>
                {tagData._id} ({tagData.count})
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Braindumps Grid */}
      <div className="grid gap-4 mb-8">
        {braindumps.map((braindump: any) => {
          const contentPreview = braindump.content.substring(0, 200);
          const url = `/braindump/${braindump.slug || braindump._id}`;

          return (
            <Link key={braindump._id.toString()} href={url}>
              <Card className="p-4 hover:border-primary transition-colors">
                <div className="space-y-3">
                  {/* Content Preview */}
                  <p className="text-sm line-clamp-3">
                    {contentPreview}
                    {braindump.content.length > 200 && '...'}
                  </p>

                  {/* Tags */}
                  {braindump.tags && braindump.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {braindump.tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {braindump.publicMetadata?.viewCount || 0}
                    </div>

                    <div>
                      {formatDistanceToNow(new Date(braindump.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {braindumps.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No braindumps found. Try a different search or tag.
            </p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            asChild
            variant="outline"
            disabled={page <= 1}
          >
            <Link href={`/braindump?page=${page - 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}>
              Previous
            </Link>
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <Button
            asChild
            variant="outline"
            disabled={page >= totalPages}
          >
            <Link href={`/braindump?page=${page + 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}>
              Next
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
