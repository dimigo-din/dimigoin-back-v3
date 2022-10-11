import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import {
  MealExceptionValues,
  MealExceptionType,
  MealExceptionApplicationStatusValues,
  MealExceptionApplicationStatus,
  MealExceptionTimeValues,
  MealExceptionTimeType,
} from '../../types';

interface IMealException extends Document {
  applier: number;
  appliers?: Array<{
    entered: boolean;
    student: number;
  }>;
  reason: string;
  exceptionType: MealExceptionType;
  applicationStatus: MealExceptionApplicationStatus;
  group: boolean;
  date: string;
  time: MealExceptionTimeType;
  rejectReason?: string;
  entered?: boolean;
}

const mealExceptionSchema = createSchema({
  applier: Type.number({ required: true }),
  appliers: Type.array().of({
    entered: Type.boolean({ default: false }),
    student: Type.number({ required: true }),
  }),
  reason: Type.string({ required: true }),
  exceptionType: Type.string({ required: true, enum: MealExceptionValues }),
  applicationStatus: Type.string({ required: true, enum: MealExceptionApplicationStatusValues, default: 'waiting' }),
  group: Type.boolean({ required: true, default: false }),
  date: Type.string({ required: true }),
  time: Type.string({ required: true, enum: MealExceptionTimeValues }),
  rejectReason: Type.string(),
  entered: Type.boolean({ default: false }),
}, { versionKey: false, timestamps: true });

const MealExceptionModel: Model<IMealException> = dalgeurakDB.model('mealexception', mealExceptionSchema);

export {
  mealExceptionSchema,
  MealExceptionModel,
};
