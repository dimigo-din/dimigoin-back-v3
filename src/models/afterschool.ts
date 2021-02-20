import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { userSchema } from './user';
import {
  AfterschoolTimeValues,
  ClassValues,
  DayValues,
  GradeValues,
  NightTimeValues,
} from '../types';

const afterschoolSchema = createSchema({
  name: Type.string({ required: true }),
  description: Type.string({ required: true }),
  targetGrades: Type.array().of(Type.number({ required: true, enum: GradeValues })),
  targetClasses: Type.array().of(Type.number({ required: true, enum: ClassValues })),
  key: Type.string(),
  teacher: Type.ref(Type.objectId()).to('User', userSchema),
  days: Type.array().of(Type.string({ required: true, enum: DayValues })),
  times: Type.array().of(Type.string({ required: true, enum: [...AfterschoolTimeValues, ...NightTimeValues] })),
  capacity: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const AfterschoolModel = typedModel('Afterschool', afterschoolSchema);

export type AfterschoolDoc = ExtractDoc<typeof afterschoolSchema>;

export {
  afterschoolSchema,
  AfterschoolModel,
};
