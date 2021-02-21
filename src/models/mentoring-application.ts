import { createSchema, Type, typedModel } from 'ts-mongoose';
import { mentoringSchema } from './mentoring';
import { userSchema } from './user';

const mentoringApplicationSchema = createSchema({
  date: Type.string({ required: true }),
  applier: Type.ref(Type.objectId()).to('User', userSchema),
  mentoring: Type.ref(Type.objectId()).to('Mentoring', mentoringSchema),
}, { versionKey: false, timestamps: true });

const MentoringApplicationModel = typedModel('MentoringApplication', mentoringApplicationSchema);

export {
  mentoringApplicationSchema,
  MentoringApplicationModel,
};
