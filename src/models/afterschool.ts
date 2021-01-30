import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import * as User from './user';
import {
  AfterschoolTimeValues, ClassValues, DayValues, GradeValues,
} from '../types';

export const schema = createSchema({
  name: Type.string({ required: true }),
  description: Type.string({ required: true }),
  grade: Type.array().of(Type.number({ required: true, enum: GradeValues })),
  class: Type.array().of(Type.number({ required: true, enum: ClassValues })),
  key: Type.string(),
  teacher: Type.ref(Type.objectId()).to('User', User.schema),
  day: Type.array().of(Type.string({ required: true, enum: DayValues })),
  time: Type.array().of(Type.string({ required: true, enum: AfterschoolTimeValues })),
  capacity: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

export type doc = ExtractDoc<typeof schema>;

export const model = typedModel('Afterschool', schema);
