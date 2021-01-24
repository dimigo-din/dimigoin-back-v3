import { createSchema, Type, typedModel } from 'ts-mongoose';
import { GradeValues, ClassValues } from '../types';

const timetableSchema = createSchema({
  date: Type.date({ required: true }),
  grade: Type.number({ required: true, enum: GradeValues }),
  class: Type.number({ required: true, enum: ClassValues }),
  subject: Type.string({ required: true, trim: true }),
  period: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const TimetableModel = typedModel('Timetable', timetableSchema);
export {
  timetableSchema,
  TimetableModel,
};
