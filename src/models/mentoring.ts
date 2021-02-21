import { createSchema, Type, typedModel } from 'ts-mongoose';
import { userSchema } from './user';
import { DayValues, GradeValues } from '../types';
import { notEmptyArray } from '../resources/model-validators';

const timeSchema = Type.object({ required: true }).of({
  hour: Type.number({ required: true }),
  minute: Type.number({ required: true }),
});

const mentoringSchema = createSchema({
  name: Type.string({ required: true, trim: true }),
  teacher: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  subject: Type.string({ required: true, trim: true }),
  days: Type.array().of(Type.string({ required: true, enum: DayValues })),
  targetGrades: Type.array({ required: true, validate: notEmptyArray })
    .of(Type.number({ enum: GradeValues })),
  duration: Type.object({ required: true }).of({
    start: timeSchema, end: timeSchema,
  }),
}, { versionKey: false, timestamps: true });

const MentoringModel = typedModel('Mentoring', mentoringSchema);

export {
  mentoringSchema,
  MentoringModel,
};
