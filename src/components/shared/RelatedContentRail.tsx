import ProjectCard from '@/components/portfolio/ProjectCard';
import PostSummary from '@/components/blog/PostSummary';
import Link from 'next/link';

type ItemType = 'projects' | 'posts';

interface RelatedContentRailProps {
  title: string;
  type: ItemType;
  items: any[];
  viewAllHref?: string;
}

export default function RelatedContentRail({ title, type, items, viewAllHref }: RelatedContentRailProps) {
  if (!items || items.length === 0) return null;
  return (
    <section className='mt-10'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{title}</h3>
        {viewAllHref ? (
          <Link href={viewAllHref} className='text-blue-600 dark:text-blue-400 hover:underline'>
            View all
          </Link>
        ) : null}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {type === 'projects'
          ? items.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} />
            ))
          : items.map((post, i) => (
              <PostSummary key={post._id} post={post} index={i} />
            ))}
      </div>
    </section>
  );
}
