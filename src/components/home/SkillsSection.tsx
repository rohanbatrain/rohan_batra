'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { skillsData, skillCategories } from '@/data/skills';

export default function SkillsSection() {
  const [showAllExpanded, setShowAllExpanded] = useState(false);
  return (
    <section className='py-16 px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
            What I Do
          </h2>
          <p className='text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
            Specializing in web, mobile, security, cloud, and platform engineering with a focus on
            performance, reliability, and user experience.
          </p>
        </motion.div>

        <Tabs defaultValue='all' className='space-y-6'>
          <TabsList className='flex w-full overflow-x-auto justify-start sm:justify-center gap-1'>
            {(() => {
              const countAll = skillsData.length;
              return (
                <TabsTrigger value='all' className='inline-flex items-center gap-2'>
                  <span>All</span>
                  <Badge variant='secondary'>{countAll}</Badge>
                </TabsTrigger>
              );
            })()}
            {skillCategories.map((c) => {
              const count = skillsData.filter((s) => s.category === c.key).length;
              return (
                <TabsTrigger key={c.key} value={c.key} className='inline-flex items-center gap-2'>
                  <span>{c.label}</span>
                  <Badge variant='secondary'>{count}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {[{ key: 'all', label: 'All' } as any, ...skillCategories].map((cat) => {
            const allItems = cat.key === 'all' ? skillsData : skillsData.filter((s) => s.category === cat.key);
            const items = cat.key === 'all' && !showAllExpanded ? allItems.slice(0, 6) : allItems;
            return (
              <TabsContent key={cat.key} value={cat.key}>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
                  {items.map(({ title, description, Icon, color, slug, blogTags, projectTags }, idx) => (
                    <motion.div
                      key={`${cat.key}-${title}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.04 * idx }}
                      viewport={{ once: true }}
                      className='group text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 will-change-transform hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-800/90'
                    >
                      <div className='mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-colors shrink-0'>
                        <Icon className={`block w-6 h-6 ${color}`} />
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                        <Link href={`/skills/${slug}`} className='hover:underline'>{title}</Link>
                      </h3>
                      <p className='text-gray-600 dark:text-gray-300 text-sm mb-4'>
                        {description}
                      </p>
                      <div className='flex items-center justify-center gap-3'>
                        <Link href={`/blog?tag=${encodeURIComponent((blogTags[0] || title).toLowerCase())}`} className='text-xs text-primary hover:underline'>Blog</Link>
                        <span className='text-muted-foreground'>•</span>
                        <Link href={`/portfolio?tag=${encodeURIComponent((projectTags[0] || title).toLowerCase())}`} className='text-xs text-primary hover:underline'>Projects</Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {cat.key === 'all' && allItems.length > 6 && (
                  <div className='flex justify-center mt-6'>
                    <button
                      onClick={() => setShowAllExpanded(v => !v)}
                      className='px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-800'
                    >
                      {showAllExpanded ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
