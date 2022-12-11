import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

export interface MealExceptionDeprive extends Document {
  student: number;
  clear: boolean;
}

const mealExceptionDepriveSchema = createSchema({
  student: Type.number({ required: true }),
  clear: Type.boolean({ default: false }),
}, { versionKey: false, timestamps: true });

const MealExceeptionDepriveModel: Model<MealExceptionDeprive> = dalgeurakDB.model('mealexceptiondeprive', mealExceptionDepriveSchema);

export {
  mealExceptionDepriveSchema,
  MealExceeptionDepriveModel,
};
