import { Types } from 'mongoose';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';

export type ProgressSnapshot = {
  moduleId: Types.ObjectId;
  completedWeight: number;
  totalWeight: number;
  percentage: number;
};

export async function fetchCourseStructure(courseId: Types.ObjectId) {
  const [modules, lessons] = await Promise.all([
    CourseModuleModel.find({ courseId }).sort({ order: 1 }).lean(),
    CourseLessonModel.find({ courseId }).lean(),
  ]);

  const lessonsById = new Map<string, any>();
  for (const l of lessons) lessonsById.set(l._id.toString(), l);

  return { modules, lessons, lessonsById };
}

export function computeModuleTotals(
  module: any,
  lessonsById: Map<string, any>
) {
  // Respect explicit lessonIds order; fallback to all lessons in module
  const lessonIds: string[] = (module.lessonIds ?? []).map((id: any) =>
    id.toString()
  );
  const ordered = lessonIds
    .map(id => lessonsById.get(id))
    .filter(Boolean) as any[];
  const fallback = Array.from(lessonsById.values()).filter(
    l => l.moduleId.toString() === module._id.toString()
  );
  const moduleLessons = ordered.length ? ordered : fallback;

  const totalWeight = moduleLessons.reduce(
    (sum, l) => sum + (typeof l.progressWeight === 'number' ? l.progressWeight : 1),
    0
  );

  return { moduleLessons, totalWeight };
}

export function computeSnapshots(
  modules: any[],
  lessonsById: Map<string, any>,
  completedLessonIds: Set<string>
) {
  const snapshots: ProgressSnapshot[] = [];
  let totalWeightAll = 0;
  let completedWeightAll = 0;

  for (const m of modules) {
    const { moduleLessons, totalWeight } = computeModuleTotals(m, lessonsById);
    const completedWeight = moduleLessons.reduce((sum, l) => {
      const id = l._id.toString();
      if (completedLessonIds.has(id)) {
        return sum + (typeof l.progressWeight === 'number' ? l.progressWeight : 1);
      }
      return sum;
    }, 0);

    const percentage = totalWeight === 0 ? 0 : Math.min(100, Math.round((completedWeight / totalWeight) * 100));
    snapshots.push({ moduleId: m._id, completedWeight, totalWeight, percentage });
    totalWeightAll += totalWeight;
    completedWeightAll += completedWeight;
  }

  const overallPercentage = totalWeightAll === 0 ? 0 : Math.min(100, Math.round((completedWeightAll / totalWeightAll) * 100));

  return { snapshots, overallPercentage };
}

export async function buildInitialProgress(courseId: Types.ObjectId) {
  const { modules, lessons, lessonsById } = await fetchCourseStructure(courseId);
  const incompleteLessonIds = lessons.map(l => l._id as Types.ObjectId);

  // First lesson defaults to first lesson of first module by order
  let currentLessonId: Types.ObjectId | undefined;
  for (const m of modules) {
    const { moduleLessons } = computeModuleTotals(m, lessonsById);
    if (moduleLessons.length) {
      currentLessonId = moduleLessons[0]._id as Types.ObjectId;
      break;
    }
  }

  const { snapshots, overallPercentage } = computeSnapshots(
    modules,
    lessonsById,
    new Set()
  );

  return {
    incompleteLessonIds,
    completedLessonIds: [] as Types.ObjectId[],
    currentLessonId,
    moduleProgress: snapshots.map(s => ({
      moduleId: s.moduleId,
      completedWeight: s.completedWeight,
      totalWeight: s.totalWeight,
      percentage: s.percentage,
    })),
    percentageComplete: overallPercentage,
  };
}

export async function recomputeProgress(
  courseId: Types.ObjectId,
  completedLessonIds: Types.ObjectId[]
) {
  const { modules, lessonsById } = await fetchCourseStructure(courseId);
  const completed = new Set(completedLessonIds.map(id => id.toString()));
  const { snapshots, overallPercentage } = computeSnapshots(
    modules,
    lessonsById,
    completed
  );

  return {
    moduleProgress: snapshots.map(s => ({
      moduleId: s.moduleId,
      completedWeight: s.completedWeight,
      totalWeight: s.totalWeight,
      percentage: s.percentage,
    })),
    percentageComplete: overallPercentage,
  };
}
export interface LessonDefinition {
  lessonId: string;
  weight?: number;
}

export interface ModuleDefinition {
  moduleId: string;
  lessons: LessonDefinition[];
}

export interface ModuleProgressSummary {
  moduleId: string;
  completedWeight: number;
  totalWeight: number;
  percentage: number;
}

export interface CourseProgressSummary {
  moduleProgress: ModuleProgressSummary[];
  percentageComplete: number;
  totalWeight: number;
  completedWeight: number;
}

const normalizeWeight = (weight?: number) =>
  weight && weight >= 0 ? weight : 1;

export const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

export const calculateModuleProgress = (
  module: ModuleDefinition,
  completedLessonIds: Set<string>
): ModuleProgressSummary => {
  let completedWeight = 0;
  let totalWeight = 0;

  for (const lesson of module.lessons) {
    const normalized = normalizeWeight(lesson.weight);
    totalWeight += normalized;
    if (completedLessonIds.has(lesson.lessonId)) {
      completedWeight += normalized;
    }
  }

  const percentage =
    totalWeight === 0
      ? 0
      : Math.min(100, (completedWeight / totalWeight) * 100);

  return {
    moduleId: module.moduleId,
    completedWeight,
    totalWeight,
    percentage: Number(percentage.toFixed(2)),
  };
};

export const calculateCourseProgress = (
  modules: ModuleDefinition[],
  completedLessonIds: string[]
): CourseProgressSummary => {
  const completedSet = new Set(completedLessonIds);
  const moduleProgress = modules.map(module =>
    calculateModuleProgress(module, completedSet)
  );

  const totals = moduleProgress.reduce(
    (acc, module) => {
      acc.completed += module.completedWeight;
      acc.total += module.totalWeight;
      return acc;
    },
    { completed: 0, total: 0 }
  );

  const percentage =
    totals.total === 0 ? 0 : (totals.completed / totals.total) * 100;

  return {
    moduleProgress,
    completedWeight: Number(totals.completed.toFixed(2)),
    totalWeight: Number(totals.total.toFixed(2)),
    percentageComplete: Number(Math.min(100, percentage).toFixed(2)),
  };
};

export const mergeCompletedLessons = (
  existing: string[],
  additions: string[],
  removals: string[] = []
): string[] => {
  const set = new Set(existing);
  additions.forEach(id => set.add(id));
  removals.forEach(id => set.delete(id));
  return Array.from(set);
};

export interface ProgressUpdateInput {
  completedLessonIds?: string[];
  currentLessonId?: string | null;
}

export interface ProgressState {
  completedLessonIds: string[];
  currentLessonId?: string | null;
}

export const applyProgressUpdate = (
  state: ProgressState,
  update: ProgressUpdateInput
): ProgressState => {
  const completedLessonIds = update.completedLessonIds
    ? mergeCompletedLessons(state.completedLessonIds, update.completedLessonIds)
    : state.completedLessonIds;

  const currentLessonId = update.currentLessonId ?? state.currentLessonId;

  return {
    completedLessonIds,
    currentLessonId,
  };
};
