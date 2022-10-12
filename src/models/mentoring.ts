import { createSchema, Type, typedModel } from 'ts-mongoose';
import { DayValues, GradeValues } from '../types';

const timeSchema = Type.object({ required: true }).of({
  hour: Type.number({ required: true, min: 0, max: 23 }),
  minute: Type.number({ required: true, min: 0, max: 59 }),
});

const mentoringSchema = createSchema({
  name: Type.string({ required: true, trim: true }),
  teacher: Type.number({ required: true }),
  subject: Type.string({ required: true, trim: true }),
  days: Type.array().of(Type.string({ required: true, enum: DayValues })),
  targetGrade: Type.number({ required: true, enum: GradeValues }),
  duration: Type.object({ required: true }).of({
    start: timeSchema, end: timeSchema,
  }),
}, { versionKey: false, timestamps: true });

const MentoringModel = typedModel('Mentoring', mentoringSchema);

export {
  mentoringSchema,
  MentoringModel,
};
