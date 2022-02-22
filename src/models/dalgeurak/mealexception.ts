import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { MealExceptionValues } from '../../types';

interface IMealException extends Document {
  serial: number;
  reason: string;
  exceptionType: string;
}

const mealExceptionSchema = createSchema({
  serial: Type.number(),
  reason: Type.string(),
  exceptionType: Type.string({ required: true, enum: MealExceptionValues }),
}, { versionKey: false, timestamps: true });

const MealExceptionModel: Model<IMealException> = dalgeurakDB.model('mealexception', mealExceptionSchema);

export {
  mealExceptionSchema,
  MealExceptionModel,
};
