import { Types } from 'mongoose';

/**
 * Lesson with potential sub-lessons
 */
interface LessonWithSubLessons {
  _id: Types.ObjectId | string;
  moduleId: Types.ObjectId | string;
  title: string;
  parentLessonId?: Types.ObjectId | string | null;
  childOrder?: (Types.ObjectId | string)[];
  subLessons?: LessonWithSubLessons[];
  [key: string]: unknown;
}

/**
 * Module with lessons
 */
interface ModuleWithLessons {
  _id: Types.ObjectId | string;
  lessonIds?: (Types.ObjectId | string)[];
  lessons?: LessonWithSubLessons[];
  [key: string]: unknown;
}

/**
 * Build ordered outline from modules and lessons
 * Orders lessons within modules and nests sub-lessons under parent lessons
 */
export function buildOrderedOutline(
  modules: ModuleWithLessons[], 
  lessons: LessonWithSubLessons[]
): ModuleWithLessons[] {
  const lessonsByModule = new Map<string, LessonWithSubLessons[]>();
  
  // Initialize lesson arrays for each module
  for (const m of modules) {
    lessonsByModule.set(String(m._id), []);
  }
  
  // Group lessons by module
  for (const l of lessons) {
    const key = String(l.moduleId);
    const arr = lessonsByModule.get(key);
    if (arr) arr.push(l);
  }
  
  return modules.map((m) => {
    const all = lessonsByModule.get(String(m._id)) || [];
    
    // Top-level lessons (no parent)
    const top = all.filter(l => !l.parentLessonId);
    
    // Order top-level lessons
    const orderedTop =
      Array.isArray(m.lessonIds) && m.lessonIds.length
        ? m.lessonIds
            .map((id) => top.find(l => String(l._id) === String(id)))
            .filter((l): l is LessonWithSubLessons => Boolean(l))
        : top.sort((a, b) => a.title.localeCompare(b.title));
    
    // Attach sub-lessons grouped by parent
    const childrenMap = new Map<string, LessonWithSubLessons[]>();
    for (const l of all) {
      if (l.parentLessonId) {
        const k = String(l.parentLessonId);
        if (!childrenMap.has(k)) childrenMap.set(k, []);
        childrenMap.get(k)!.push(l);
      }
    }
    
    const withChildren = orderedTop.map((l) => {
      const children = childrenMap.get(String(l._id)) || [];
      let orderedChildren = children;
      
      if (Array.isArray(l.childOrder) && l.childOrder.length) {
        const idSet = new Set(l.childOrder.map((id) => String(id)));
        const map = new Map(children.map((c) => [String(c._id), c]));
        orderedChildren = l.childOrder
          .map((id) => map.get(String(id)))
          .filter((c): c is LessonWithSubLessons => Boolean(c));
        
        // Append any remaining children not in childOrder (new ones) alphabetically
        const remaining = children.filter(
          (c) => !idSet.has(String(c._id))
        );
        orderedChildren = [
          ...orderedChildren,
          ...remaining.sort((a, b) => a.title.localeCompare(b.title)),
        ];
      } else {
        orderedChildren = children.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
      }
      
      return { ...l, subLessons: orderedChildren };
    });
    
    return { ...m, lessons: withChildren };
  });
}
