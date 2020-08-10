import { ObjectId } from 'mongodb';
import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import {
  ClassValues, GradeValues, UserType, UserTypeValues, GenderValues,
} from '../types';

const userSchema = createSchema({
  idx: Type.number({ required: true, unique: true }),
  username: Type.string({ required: true, unique: true }),
  name: Type.string({ required: true }),
  gender: Type.string({ enum: [...GenderValues, null] }),
  phone: Type.string(),
  userType: Type.string({ required: true, enum: UserTypeValues }),
  grade: Type.number({ enum: GradeValues }),
  class: Type.number({ enum: ClassValues }),
  number: Type.number(),
  serial: Type.number(),
  photo: Type.array().of(Type.string()),
}, { versionKey: false, timestamps: true });

type UserDoc = ExtractDoc<typeof userSchema>;

const UserModel = typedModel('User', userSchema, undefined, undefined, {
  findByIdx(idx: number): UserDoc {
    return this.findOne({ idx });
  },
  findBySerial(serial: number): UserDoc {
    return this.findOne({ serial });
  },
  findStudentById(id: ObjectId): UserDoc {
    return this.findOne({ userType: 'S', _id: id });
  },
  findByUserType(userType: UserType[]): UserDoc[] {
    return this.find({ userType: { $in: userType } });
  },
  findStudents(): UserDoc[] {
    // userType 'S'에는 졸업생도 포함되어 있어서 학년으로 재학생을 찾아야 함.
    return this.find({ grade: { $gte: 1, $lte: 3 } });
  },
  findTeachers(): UserDoc[] {
    return this.findByUserType(['D', 'T']);
  },
});

export { userSchema, UserModel };
