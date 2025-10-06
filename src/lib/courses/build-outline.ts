export function buildOrderedOutline(modules: any[], lessons: any[]) {
  const lessonsByModule = new Map<string, any[]>();
  for (const m of modules as any[]) lessonsByModule.set(String(m._id), []);
  for (const l of lessons as any[]) {
    const key = String(l.moduleId);
    const arr = lessonsByModule.get(key);
    if (arr) arr.push(l);
  }
  return modules.map((m: any) => {
    const all = (lessonsByModule.get(String(m._id)) || []) as any[];
    // Top-level lessons (no parent)
    const top = all.filter(l => !l.parentLessonId);
    const orderedTop = Array.isArray(m.lessonIds) && m.lessonIds.length
      ? (m.lessonIds as any[])
          .map((id: any) => top.find(l => String(l._id) === String(id)))
          .filter(Boolean)
      : top.sort((a: any, b: any) => a.title.localeCompare(b.title));
    // Attach sub-lessons grouped by parent
    const childrenMap = new Map<string, any[]>();
    for (const l of all) {
      if (l.parentLessonId) {
        const k = String(l.parentLessonId);
        if (!childrenMap.has(k)) childrenMap.set(k, []);
        childrenMap.get(k)!.push(l);
      }
    }
    const withChildren = orderedTop.map((l: any) => {
      const children = childrenMap.get(String(l._id)) || [];
      let orderedChildren = children;
      if (Array.isArray(l.childOrder) && l.childOrder.length) {
        const idSet = new Set(l.childOrder.map((id: any) => String(id)));
        const map = new Map(children.map((c: any) => [String(c._id), c]));
        orderedChildren = l.childOrder
          .map((id: any) => map.get(String(id)))
          .filter(Boolean);
        // Append any remaining children not in childOrder (new ones) alphabetically
        const remaining = children.filter((c: any) => !idSet.has(String(c._id)));
        orderedChildren = [
          ...orderedChildren,
          ...remaining.sort((a: any, b: any) => a.title.localeCompare(b.title)),
        ];
      } else {
        orderedChildren = children.sort((a: any, b: any) => a.title.localeCompare(b.title));
      }
      return { ...l, subLessons: orderedChildren };
    });
    return { ...m, lessons: withChildren };
  });
}
