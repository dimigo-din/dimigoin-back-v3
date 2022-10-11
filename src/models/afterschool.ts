import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { placeSchema } from './place';
import { notEmptyArray } from '../resources/model-validators';
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
  targetGrades: Type.array({ required: true, validate: notEmptyArray })
    .of(Type.number({ enum: GradeValues })),
  targetClasses: Type.array({ required: true, validate: notEmptyArray })
    .of(Type.number({ enum: ClassValues })),
  key: Type.string(),
  teacher: Type.number({ required: true }),
  days: Type.array().of(Type.string({ required: true, enum: DayValues })),
  times: Type.array().of(Type.string({ required: true, enum: [...AfterschoolTimeValues, ...NightTimeValues] })),
  capacity: Type.number({ required: true }),
  place: Type.ref(Type.objectId({ required: true })).to('Place', placeSchema),
}, { versionKey: false, timestamps: true });

const AfterschoolModel = typedModel('Afterschool', afterschoolSchema);

export type AfterschoolDoc = ExtractDoc<typeof afterschoolSchema>;

export {
  afterschoolSchema,
  AfterschoolModel,
};
