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

const userSchema = createSchema({
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
  tokens: Type.array({ select: false, default: [] }).of(Type.string()),
}, { versionKey: false, timestamps: true });

type UserDoc = ExtractDoc<typeof userSchema>;

const UserModel = typedModel('User', userSchema, undefined, undefined, {
  findByIdx(idx: number): UserDoc {
    return this.findOne({ idx });
  },
  findStudentById(id: ObjectId): UserDoc {
    return this.findOne({ userType: 'S', _id: id });
  },
  findByUserType(userType: UserType[]): UserDoc[] {
    return this.find({ userType: { $in: userType } });
  },
  findStudents(): UserDoc[] {
    return this.find({
      userType: 'S',
      serial: { $ne: null },
    }).sort('serial');
  },
  findTeachers(): UserDoc[] {
    return this.findByUserType(['D', 'T']);
  },
});

export { userSchema, UserModel };
