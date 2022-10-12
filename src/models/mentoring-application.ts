import { createSchema, Type, typedModel } from 'ts-mongoose';
import { mentoringSchema } from './mentoring';

const mentoringApplicationSchema = createSchema({
  date: Type.string({ required: true }),
  applier: Type.number({ required: true }),
  mentoring: Type.ref(Type.objectId()).to('Mentoring', mentoringSchema),
}, { versionKey: false, timestamps: true });

const MentoringApplicationModel = typedModel('MentoringApplication', mentoringApplicationSchema);

export {
  mentoringApplicationSchema,
  MentoringApplicationModel,
};
