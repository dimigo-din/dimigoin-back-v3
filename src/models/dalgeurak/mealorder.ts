import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { MealOrderValues, ClassType } from '../../types';

export interface ImealOrder extends Document {
  lunch?: Array<ClassType>;
  dinner?: Array<ClassType>;
  field: 'sequences' | 'times' | 'intervalTime';
  extraMinute?: number;
}

const mealOrderSchema = createSchema({
  lunch: Type.array().of([Number]),
  dinner: Type.array().of([Number]),
  field: Type.string({ enum: MealOrderValues, required: true }),
  extraMinute: Type.number(),
}, { versionKey: false, timestamps: false });

const MealOrderModel: Model<ImealOrder> = dalgeurakDB.model('mealorder', mealOrderSchema);

export {
  mealOrderSchema,
  MealOrderModel,
};
