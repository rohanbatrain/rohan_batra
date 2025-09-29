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
