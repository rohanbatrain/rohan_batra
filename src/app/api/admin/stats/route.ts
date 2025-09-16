import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import BlogPostModel from '@/models/BlogPost';
import ProjectModel from '@/models/Project';
import CommentModel from '@/models/Comment';
import LikeModel from '@/models/Like';
import SiteSettingModel from '@/models/SiteSetting';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    await connectToDatabase();

    // Aggregate statistics
    const [
      userCount,
      postCount,
      projectCount,
      commentCount,
      likeCount,
      siteSettings,
    ] = await Promise.all([
      UserModel.countDocuments(),
      BlogPostModel.countDocuments(),
      ProjectModel.countDocuments(),
      CommentModel.countDocuments(),
      LikeModel.countDocuments(),
      SiteSettingModel.countDocuments(),
    ]);

    // Recent activity (last 7 days)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPosts = await BlogPostModel.find({
      createdAt: { $gte: since },
    }).countDocuments();
    const recentProjects = await ProjectModel.find({
      createdAt: { $gte: since },
    }).countDocuments();
    const recentComments = await CommentModel.find({
      createdAt: { $gte: since },
    }).countDocuments();
    const recentLikes = await LikeModel.find({
      createdAt: { $gte: since },
    }).countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        posts: postCount,
        projects: projectCount,
        comments: commentCount,
        likes: likeCount,
        siteSettings,
        recent: {
          posts: recentPosts,
          projects: recentProjects,
          comments: recentComments,
          likes: recentLikes,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
