import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import {
  GenderValues,
  UserTypeValues,
  GradeValues,
  ClassValues,
  UserType,
} from '../types';

export const schema = createSchema({
  idx: Type.number({ required: true, unique: true }),
  username: Type.string({ required: true, unique: true }),
  name: Type.string({ required: true }),
  gender: Type.string({ enum: [...GenderValues, null] }),
  phone: Type.string({ select: false }),
  userType: Type.string({ required: true, enum: UserTypeValues }),
  grade: Type.number({ enum: GradeValues }),
  class: Type.number({ enum: ClassValues }),
  number: Type.number(),
  serial: Type.number(),
  photo: Type.array({ select: false }).of(Type.string()),
}, { versionKey: false, timestamps: true });

export type doc = ExtractDoc<typeof schema>;

export const model = typedModel('User', schema);

const findByIdx = async (idx: number) => {
  return await model.findOne({ idx });
};
const findBySerial = async (serial: number) => {
  return await model.findOne({ serial });
};

const findStudentById = async (id: ObjectId) => {
  return await model.findOne({ userType: 'S', _id: id });
};

const findByUserType = async (userType: UserType[]) => {
  return await model.find({ userType: { $in: userType } });
};

const findStudents = async () => {
  return await model.find({ userType: 'S' });
};

const findTeachers = async () => {
  return await model.findByUserType(['D', 'T']);
};

export {
  findByIdx,
  findBySerial,
  findStudentById,
  findByUserType,
  findStudents,
  findTeachers,
};
