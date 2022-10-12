import { createSchema, Type, typedModel } from 'ts-mongoose';
import { UserTypeValues } from '../types';

const userTypeSchema = createSchema({
  userId: Type.number({ required: true }),
  type: Type.string({ required: true, enum: UserTypeValues }),
}, { versionKey: false, timestamps: false });

const UserTypeModel = typedModel('Usertype', userTypeSchema);
export {
  userTypeSchema,
  UserTypeModel,
};
