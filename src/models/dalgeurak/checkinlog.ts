import { Document, Model } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { MealStatusType, MealStatusValues } from '../../types';

export interface CheckinLog extends Document {
  date: string;
  student: number;
  status: MealStatusType;
  class: number;
  grade: number;
  number: number;
}

const checkinLogSchema = createSchema({
  date: Type.string({ required: true }),
  student: Type.number({ required: true }),
  status: Type.string({ required: true, enum: MealStatusValues, default: 'empty' }),
  class: Type.number({ required: true }),
  grade: Type.number({ required: true }),
  number: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const CheckinLogModel: Model<CheckinLog> = dalgeurakDB.model('CheckinLog', checkinLogSchema);

export {
  checkinLogSchema,
  CheckinLogModel,
};
