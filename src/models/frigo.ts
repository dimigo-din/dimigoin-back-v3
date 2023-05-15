import { createSchema, Type, typedModel } from 'ts-mongoose';
import { GradeValues, ClassValues, FrigoStatusValues } from '../types';

const frigoSchema = createSchema({
  name: Type.string({ required: true }),
  grade: Type.number({ require: true, enum: GradeValues }),
  class: Type.number({ require: true, enum: ClassValues }),
  userId: Type.number({ required: true }),
  reason: Type.string({ required: true, maxLength: 50 }),
  status: Type.string({ required: true, enum: FrigoStatusValues }),
}, { versionKey: false, timestamps: true });

const FrigoModel = typedModel('Frigo', frigoSchema);

export {
  frigoSchema,
  FrigoModel,
};
