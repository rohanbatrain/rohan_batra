import { Types } from 'mongoose';
import FlashcardDeckModel from '@/models/FlashcardDeck';

type CourseTarget = {
  scope: 'course';
  courseId: Types.ObjectId;
};

type ModuleTarget = {
  scope: 'module';
  courseId: Types.ObjectId;
  moduleId: Types.ObjectId;
};

type LessonTarget = {
  scope: 'lesson';
  courseId: Types.ObjectId;
  moduleId: Types.ObjectId;
  lessonId: Types.ObjectId;
};

export type DeckLinkTarget = CourseTarget | ModuleTarget | LessonTarget;

const buildTargetDoc = (target: DeckLinkTarget) => {
  const doc: Record<string, unknown> = {
    scope: target.scope,
    courseId: target.courseId,
  };

  if (target.scope !== 'course') {
    doc.moduleId = target.moduleId;
  }

  if (target.scope === 'lesson') {
    doc.lessonId = target.lessonId;
  }

  return doc;
};

export async function syncDeckLinkTargets(
  previousIds: Types.ObjectId[],
  nextIds: Types.ObjectId[],
  target: DeckLinkTarget
) {
  const prevSet = new Set(previousIds.map(id => id.toString()));
  const nextSet = new Set(nextIds.map(id => id.toString()));

  const toAdd = Array.from(nextSet).filter(id => !prevSet.has(id));
  const toRemove = Array.from(prevSet).filter(id => !nextSet.has(id));

  await Promise.all([
    ...toAdd.map(id =>
      FlashcardDeckModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $addToSet: { linkTargets: buildTargetDoc(target) } }
      )
    ),
    ...toRemove.map(id =>
      FlashcardDeckModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $pull: { linkTargets: buildTargetDoc(target) } }
      )
    ),
  ]);
}
