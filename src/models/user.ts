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
import { services } from '../services';

const userSchema = createSchema({
  idx: Type.number({ required: true, unique: true }),
  username: Type.string({ required: true, unique: true }),
  name: Type.string({ required: true }),
  gender: Type.string({ enum: [...GenderValues, null] }),
  phone: Type.string({ select: false }),
  userType: Type.string({ required: true, enum: UserTypeValues }),
  photos: Type.array({ select: false }).of(Type.string()),
  tokens: Type.array({ select: false, default: [] }).of(Type.string()),
  permissions: Type.array({ required: true, default: [], select: false })
    .of(Type.string({ enum: services })),
  // 학생 정보
  grade: Type.number({ enum: GradeValues }),
  class: Type.number({ enum: ClassValues }),
  number: Type.number(),
  serial: Type.number(),
  // 교사 정보
  position: Type.string({ trim: true }),
  role: Type.string({ trim: true }),
}, { versionKey: false, timestamps: true });

export type UserDoc = ExtractDoc<typeof userSchema>;

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
