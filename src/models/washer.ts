import { createSchema, Type, typedModel } from 'ts-mongoose';
import { GenderValues, GradeValues, WasherValues } from '../types';

const washerSchema = createSchema({
  name: Type.string({ required: true, enum: WasherValues }),
  grade: Type.array({ required: true }).of(Type.number({ enum: GradeValues })),
  gender: Type.string({ required: true, enum: GenderValues }),
  userIdx: Type.number({ required: true, unique: true }),
}, { versionKey: false, timestamps: true });

const WasherModel = typedModel('Washer', washerSchema);
export {
  washerSchema,
  WasherModel,
};
