import { createSchema, Type, typedModel } from 'ts-mongoose';
import { GradeValues, ClassValues } from '../types';

const timetableSchema = createSchema({
  date: Type.string({ required: true }),
  grade: Type.number({ required: true, enum: GradeValues }),
  class: Type.number({ required: true, enum: ClassValues }),
  sequence: Type.array({ required: true }).of(Type.string()),
}, { versionKey: false, timestamps: true });

const TimetableModel = typedModel('Timetable', timetableSchema);
export {
  timetableSchema,
  TimetableModel,
};
