import Link from 'next/link';
import { mapTagsToSkills } from '@/lib/taxonomy';

interface SkillChipsProps {
  tags: string[];
  max?: number;
}

export default function SkillChips({ tags, max = 6 }: SkillChipsProps) {
  const skills = mapTagsToSkills(tags).slice(0, max);
  if (skills.length === 0) return null;
  return (
    <div className='flex flex-wrap gap-2'>
      {skills.map(({ slug, title, Icon }) => (
        <Link
          key={slug}
          href={`/skills/${slug}`}
          className='inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
        >
          {Icon ? <Icon className='h-3.5 w-3.5' /> : null}
          {title}
        </Link>
      ))}
    </div>
  );
}
