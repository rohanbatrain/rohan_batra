import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { evidenceCategories } from '@/data/evidence';

export default function EvidencePage() {
  return (
    <div className='px-6 lg:px-8 py-10 max-w-6xl mx-auto'>
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold'>Project Evidence Mapping</h1>
        <p className='text-muted-foreground mt-2'>
          Direct, verifiable links connecting repositories to resume categories.
        </p>
        <div className='mt-4 flex items-center justify-center gap-3 text-sm'>
          <Link
            href='/evidence/github-project-evidence-mapping.md'
            className='underline'
          >
            GitHub Project Evidence Mapping (MD)
          </Link>
          <span>•</span>
          <Link
            href='/evidence/complete_project_evidence_mapping.csv'
            className='underline'
          >
            Complete Mapping (CSV)
          </Link>
          <span>•</span>
          <Link href='/evidence/github_project_urls.csv' className='underline'>
            Project URLs (CSV)
          </Link>
        </div>
      </div>

      <Tabs
        defaultValue={evidenceCategories[0]?.key ?? 'security'}
        className='space-y-6'
      >
        <TabsList className='flex w-full overflow-x-auto justify-start sm:justify-center gap-1'>
          {evidenceCategories.map(c => (
            <TabsTrigger
              key={c.key}
              value={c.key}
              className='inline-flex items-center gap-2'
            >
              <span>{c.label}</span>
              <Badge variant='secondary'>{c.items.length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {evidenceCategories.map(c => (
          <TabsContent key={c.key} value={c.key}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {c.items.map(it => (
                <Card
                  key={it.url}
                  className='p-4 space-y-2 hover:shadow-lg transition-shadow'
                >
                  <div className='flex items-center justify-between'>
                    <div className='font-medium'>{it.title}</div>
                    <Badge variant='outline'>{it.repo}</Badge>
                  </div>
                  <ul className='list-disc list-inside text-sm text-muted-foreground'>
                    {it.points.map(p => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className='pt-1'>
                    <Link
                      href={it.url}
                      target='_blank'
                      className='text-primary underline text-sm'
                    >
                      View on GitHub
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
