import { getTryHackMeSummary } from '@/lib/tryhackme-service';
import { getPublishedBlogPosts } from '@/lib/blog-service';
import { getPublishedProjects } from '@/lib/portfolio-service';
import Link from 'next/link';
import RelatedContentRail from '@/components/shared/RelatedContentRail';

export default async function TryHackMeSection() {
  const { profile, recentBadges, recentRooms } = await getTryHackMeSummary(6);

  if (!profile && recentBadges.length === 0 && recentRooms.length === 0) return null;

  // Fetch related content by common security tags
  const securityTags = ['security', 'authentication', 'jwt', 'cybersecurity'];
  const [postsAll, projectsAll] = await Promise.all([
    getPublishedBlogPosts(50),
    getPublishedProjects(50),
  ]);
  const relatedPosts = postsAll
    .filter(p => Array.isArray(p.tags) && p.tags.some(t => securityTags.includes(String(t).toLowerCase())))
    .slice(0, 3);
  const relatedProjects = projectsAll
    .filter(pr => Array.isArray(pr.tags) && pr.tags.some(t => securityTags.includes(String(t).toLowerCase())))
    .slice(0, 3);

  return (
    <section className='py-16 px-6 lg:px-8 bg-white dark:bg-gray-800'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex items-center justify-between mb-2'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>TryHackMe Progress</h2>
            <p className='text-gray-600 dark:text-gray-300'>Rooms completed and badges earned while sharpening security skills.</p>
          </div>
          {profile?.profileUrl && (
            <Link href={String(profile.profileUrl)} target='_blank' className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors'>View Profile →</Link>
          )}
        </div>
        {profile && (
          <div className='mb-8 text-sm text-slate-600 dark:text-slate-400'>
            <span className='inline-flex items-center gap-2'>
              <span className='inline-block h-2 w-2 rounded-full bg-green-500' />
              Rank: <strong className='text-slate-800 dark:text-slate-200'>{profile.rank || '—'}</strong> · Points: <strong className='text-slate-800 dark:text-slate-200'>{profile.points ?? 0}</strong>
            </span>
          </div>
        )}

        {/* Stats */}
        {profile && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-10'>
            <div className='rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
              <div className='text-xs text-gray-500 dark:text-gray-400'>Rank</div>
              <div className='text-xl font-semibold text-gray-900 dark:text-white'>{profile.rank || '—'}</div>
            </div>
            <div className='rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
              <div className='text-xs text-gray-500 dark:text-gray-400'>Points</div>
              <div className='text-xl font-semibold text-gray-900 dark:text-white'>{profile.points ?? 0}</div>
            </div>
            <div className='rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
              <div className='text-xs text-gray-500 dark:text-gray-400'>Badges</div>
              <div className='text-xl font-semibold text-gray-900 dark:text-white'>{profile.badgesCount ?? recentBadges.length}</div>
            </div>
            <div className='rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
              <div className='text-xs text-gray-500 dark:text-gray-400'>Rooms</div>
              <div className='text-xl font-semibold text-gray-900 dark:text-white'>{profile.roomsCount ?? recentRooms.length}</div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
          {/* Badges */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Recent Badges</h3>
            {recentBadges.length ? (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {recentBadges.map(b => (
                  <div key={b._id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900'>
                    <div className='flex items-center gap-3'>
                      {b.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.imageUrl} alt={b.title} className='w-10 h-10 rounded-full object-cover' />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700' />
                      )}
                      <div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white line-clamp-2'>{b.title}</div>
                        {b.category && (
                          <div className='text-xs text-gray-500 dark:text-gray-400'>{b.category}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-sm text-gray-500 dark:text-gray-400'>No badges yet.</div>
            )}
          </div>

          {/* Rooms */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Recent Rooms</h3>
            {recentRooms.length ? (
              <div className='space-y-3'>
                {recentRooms.map(r => (
                  <div key={r._id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>{r.title}</div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>{r.difficulty} • {r.points ?? 0} pts</div>
                      </div>
                      {r.link && (
                        <Link href={String(r.link)} target='_blank' className='text-blue-600 dark:text-blue-400 text-sm'>Open →</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-sm text-gray-500 dark:text-gray-400'>No rooms recorded yet.</div>
            )}
          </div>
        </div>

        {/* Related content */}
        <RelatedContentRail title='Related Security Articles' type='posts' items={relatedPosts} viewAllHref='/blog?tag=security' />
        <RelatedContentRail title='Related Security Projects' type='projects' items={relatedProjects} viewAllHref='/portfolio?tag=security' />
      </div>
    </section>
  );
}
