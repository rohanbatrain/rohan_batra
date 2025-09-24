import Link from 'next/link';
import { skillsData, skillCategories } from '@/data/skills';

export default function SkillsIndexPage() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-10'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-3'>Skills</h1>
          <p className='text-gray-600 dark:text-gray-300'>Browse by specialty to see related posts and projects.</p>
        </div>

        {skillCategories.map(cat => {
          const items = skillsData.filter(s => s.category === cat.key);
          if (items.length === 0) return null;
          return (
            <section key={cat.key} className='mb-10'>
              <h2 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>{cat.label}</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {items.map(s => (
                  <Link
                    key={s.slug}
                    href={`/skills/${s.slug}`}
                    className='p-5 rounded-xl bg-white dark:bg-gray-800 shadow hover:shadow-lg border border-transparent hover:border-primary/20 transition'
                  >
                    <div className='flex items-center gap-3 mb-2'>
                      <s.Icon className={`h-5 w-5 ${s.color}`} />
                      <span className='font-medium text-gray-900 dark:text-white'>{s.title}</span>
                    </div>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>{s.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
