import { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ExperienceForm from '@/components/experience/ExperienceForm';

export const metadata: Metadata = {
  title: 'Create Experience | Admin',
  description: 'Create a new professional experience',
};

export default async function NewExperiencePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/experience/new');
  }

  const userRole = (user.publicMetadata?.role as string) || 'user';
  if (!['editor', 'admin'].includes(userRole)) {
    redirect('/access-denied');
  }

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Create New Experience</h1>
        <p className='mt-2 text-muted-foreground'>
          Add a new professional experience to your portfolio
        </p>
      </div>

      <div className='rounded-lg border bg-card p-8'>
        <ExperienceForm mode='create' />
      </div>
    </div>
  );
}
