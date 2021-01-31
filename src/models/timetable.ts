import { createSchema, Type, typedModel } from 'ts-mongoose';
import { GradeValues, ClassValues } from '../types';

export const schema = createSchema({
  date: Type.date({ required: true }),
  grade: Type.number({ required: true, enum: GradeValues }),
  class: Type.number({ required: true, enum: ClassValues }),
  sequence: Type.array({ required: true }).of(Type.string()),
}, { versionKey: false, timestamps: true });

export const model = typedModel('Timetable', schema);

