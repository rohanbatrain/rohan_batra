import { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import ExperienceForm from '@/components/experience/ExperienceForm';
import { ExperienceService } from '@/lib/services/experience-service';

export const metadata: Metadata = {
  title: 'Edit Experience | Admin',
  description: 'Edit professional experience',
};

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin/experience');
  }

  const userRole = (user.publicMetadata?.role as string) || 'user';
  if (!['editor', 'admin'].includes(userRole)) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const experience = await ExperienceService.getById(id);

  if (!experience) {
    notFound();
  }

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Edit Experience</h1>
        <p className='mt-2 text-muted-foreground'>
          Update professional experience details
        </p>
      </div>

      <div className='rounded-lg border bg-card p-8'>
        <ExperienceForm experience={experience} mode='edit' />
      </div>
    </div>
  );
}
