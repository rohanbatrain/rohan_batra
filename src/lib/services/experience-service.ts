import ExperienceModel from '@/models/Experience';
import connectToDatabase from '@/lib/mongodb';
import {
  Experience,
  ExperienceCreateInput,
  ExperienceUpdateInput,
  ExperienceReorderUpdate,
} from '@/types/experience';
import {
  enrichExperience,
  enrichExperiences,
  sortExperiences,
} from '@/lib/utils/experience-utils';

export interface ExperienceListParams {
  page?: number;
  limit?: number;
  published?: boolean;
  search?: string;
}

export interface ExperienceListResponse {
  experiences: Experience[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service layer for Experience operations
 * Handles business logic and database interactions
 */
export class ExperienceService {
  /**
   * Get list of experiences with pagination and filters
   */
  static async list(
    params: ExperienceListParams = {}
  ): Promise<ExperienceListResponse> {
    await connectToDatabase();

    const { page = 1, limit = 10, published, search } = params;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (typeof published === 'boolean') {
      query.published = published;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute queries in parallel
    const [experiences, total] = await Promise.all([
      ExperienceModel.find(query)
        .sort({ displayOrder: 1, startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ExperienceModel.countDocuments(query).exec(),
    ]);

    // Convert to plain objects and enrich with computed fields
    const plainExperiences: Experience[] = experiences.map(exp => ({
      ...exp,
      _id: exp._id.toString(),
      startDate: exp.startDate,
      endDate: exp.endDate || null,
      createdAt: exp.createdAt!,
      updatedAt: exp.updatedAt!,
    }));

    const enrichedExperiences = enrichExperiences(plainExperiences);

    return {
      experiences: enrichedExperiences,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all published experiences (for public display)
   */
  static async getPublished(limitCount?: number): Promise<Experience[]> {
    await connectToDatabase();

    let query = ExperienceModel.find({ published: true })
      .sort({ displayOrder: 1, startDate: -1 })
      .lean();

    if (limitCount) {
      query = query.limit(limitCount);
    }

    const experiences = await query.exec();

    const plainExperiences: Experience[] = experiences.map(exp => ({
      ...exp,
      _id: exp._id.toString(),
      startDate: exp.startDate,
      endDate: exp.endDate || null,
      createdAt: exp.createdAt!,
      updatedAt: exp.updatedAt!,
    }));

    return enrichExperiences(plainExperiences);
  }

  /**
   * Get a single experience by ID
   */
  static async getById(id: string): Promise<Experience | null> {
    await connectToDatabase();

    const experience = await ExperienceModel.findById(id).lean().exec();

    if (!experience) {
      return null;
    }

    const plainExperience: Experience = {
      ...experience,
      _id: experience._id.toString(),
      startDate: experience.startDate,
      endDate: experience.endDate || null,
      createdAt: experience.createdAt!,
      updatedAt: experience.updatedAt!,
    };

    return enrichExperience(plainExperience);
  }

  /**
   * Create a new experience
   */
  static async create(input: ExperienceCreateInput): Promise<Experience> {
    await connectToDatabase();

    // If no displayOrder provided, set to next available
    if (input.displayOrder === undefined) {
      const maxOrder = await ExperienceModel.findOne()
        .sort({ displayOrder: -1 })
        .select('displayOrder')
        .lean()
        .exec();

      input.displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
    }

    const experience = await ExperienceModel.create(input);

    const plainExperience: Experience = {
      ...experience.toObject(),
      _id: experience._id.toString(),
      startDate: experience.startDate,
      endDate: experience.endDate || null,
      createdAt: experience.createdAt!,
      updatedAt: experience.updatedAt!,
    };

    return enrichExperience(plainExperience);
  }

  /**
   * Update an existing experience
   */
  static async update(
    id: string,
    input: ExperienceUpdateInput
  ): Promise<Experience | null> {
    await connectToDatabase();

    const experience = await ExperienceModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();

    if (!experience) {
      return null;
    }

    const plainExperience: Experience = {
      ...experience,
      _id: experience._id.toString(),
      startDate: experience.startDate,
      endDate: experience.endDate || null,
      createdAt: experience.createdAt!,
      updatedAt: experience.updatedAt!,
    };

    return enrichExperience(plainExperience);
  }

  /**
   * Delete an experience
   */
  static async delete(id: string): Promise<boolean> {
    await connectToDatabase();

    const result = await ExperienceModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Reorder experiences (batch update displayOrder)
   */
  static async reorder(updates: ExperienceReorderUpdate[]): Promise<boolean> {
    await connectToDatabase();

    // Use bulkWrite for efficient batch update
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { displayOrder: update.displayOrder } },
      },
    }));

    const result = await ExperienceModel.bulkWrite(bulkOps);
    return result.modifiedCount === updates.length;
  }

  /**
   * Toggle published status
   */
  static async togglePublished(
    id: string,
    published: boolean
  ): Promise<Experience | null> {
    return this.update(id, { published });
  }

  /**
   * Get count of experiences
   */
  static async count(published?: boolean): Promise<number> {
    await connectToDatabase();

    const query = published !== undefined ? { published } : {};
    return ExperienceModel.countDocuments(query).exec();
  }
}
