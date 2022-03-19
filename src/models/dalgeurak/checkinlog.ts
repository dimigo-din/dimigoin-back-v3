import { createSchema, Type } from 'ts-mongoose';
import { userSchema } from '../user';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { MealStatusValues } from '../../types';

const checkinLogSchema = createSchema({
  date: Type.string({ required: true }),
  student: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  status: Type.string({ required: true, enum: MealStatusValues, default: 'empty' }),
  class: Type.number({ required: true }),
  grade: Type.number({ required: true }),
  number: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const CheckinLogModel = dalgeurakDB.model('CheckinLog', checkinLogSchema);

export {
  checkinLogSchema,
  CheckinLogModel,
};
