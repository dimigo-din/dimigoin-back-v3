import { ObjectId } from 'mongodb';
import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import {
  MealExceptionValues,
  MealExceptionType,
  MealExceptionApplicationStatusValues,
  MealExceptionApplicationStatus,
  MealTimeValues,
  MealTimeType,
} from '../../types';
import { userSchema } from '../user';

interface IMealException extends Document {
  applier: ObjectId;
  appliers?: Array<{
    entered: boolean;
    sid: ObjectId;
  }>;
  reason: string;
  exceptionType: MealExceptionType;
  applicationStatus: MealExceptionApplicationStatus;
  group: boolean;
  date: string;
  time: MealTimeType;
  rejectReason?: string;
  entered?: boolean;
}

const mealExceptionSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  appliers: Type.array().of(Type.object().of({
    entered: Type.boolean({ default: false }),
    sid: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  })),
  reason: Type.string({ required: true }),
  exceptionType: Type.string({ required: true, enum: MealExceptionValues }),
  applicationStatus: Type.string({ required: true, enum: MealExceptionApplicationStatusValues, default: 'waiting' }),
  group: Type.boolean({ required: true, default: false }),
  date: Type.string({ required: true }),
  time: Type.string({ required: true, enum: MealTimeValues }),
  rejectReason: Type.string(),
  entered: Type.boolean({ default: false }),
}, { versionKey: false, timestamps: true });

const MealExceptionModel: Model<IMealException> = dalgeurakDB.model('mealexception', mealExceptionSchema);

export {
  mealExceptionSchema,
  MealExceptionModel,
};
