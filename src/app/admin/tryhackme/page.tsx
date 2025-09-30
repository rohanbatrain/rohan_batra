import Link from 'next/link';

export default function TryHackMeAdmin() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>TryHackMe</h1>
        <p className='text-gray-600 dark:text-gray-300'>Manage badges and completed rooms.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Badges</h2>
          <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>Add and manage earned badges.</p>
          <div className='flex gap-3'>
            <Link href='/admin/tryhackme/badges' className='px-3 py-2 rounded-md bg-blue-600 text-white text-sm'>View Badges</Link>
            <Link href='/admin/tryhackme/badges?new=1' className='px-3 py-2 rounded-md bg-slate-700 text-white text-sm'>Add Badge</Link>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Completed Rooms</h2>
          <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>Track completed rooms and points.</p>
          <div className='flex gap-3'>
            <Link href='/admin/tryhackme/rooms' className='px-3 py-2 rounded-md bg-blue-600 text-white text-sm'>View Rooms</Link>
            <Link href='/admin/tryhackme/rooms?new=1' className='px-3 py-2 rounded-md bg-slate-700 text-white text-sm'>Add Room</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
