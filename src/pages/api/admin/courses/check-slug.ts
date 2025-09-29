import { NextApiRequest, NextApiResponse } from 'next';
import { ICourse } from '@/models/Course';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Slug is required' });
  }

  try {
    await connectToDatabase();
    const existingCourse = await Course.findOne({ slug });
    const isAvailable = !existingCourse;
    return res.status(200).json({ isAvailable });
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
