import {
  createSchema, Type,
} from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import {
  GradeValues,
  ClassValues,
  MealStatusValues,
} from '../../types';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

export interface IStudent extends Document {
  idx: number;
  name: string;
  grade: number;
  class: number;
  serial: number;
  status: string;
}

const studentSchema = createSchema({
  idx: Type.number({ required: true, unique: true }),
  name: Type.string({ required: true }),
  grade: Type.number({ enum: GradeValues }),
  class: Type.number({ enum: ClassValues }),
  number: Type.number(),
  serial: Type.number(),
  status: Type.string({ required: true, enum: MealStatusValues, default: 'empty' }),
}, { versionKey: false, timestamps: true });

const StudentModel: Model<IStudent> = dalgeurakDB.model('Student', studentSchema);

export { studentSchema, StudentModel };
