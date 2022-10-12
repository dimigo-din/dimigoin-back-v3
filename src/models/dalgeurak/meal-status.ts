import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import {
  MealStatusType,
  MealStatusValues,
} from '../../types';

interface IMealStatus extends Document {
  userId: number;
  mealStatus: MealStatusType;
}

const mealStatusSchema = createSchema({
  userId: Type.number({ required: true }),
  mealStatus: Type.string({ enum: MealStatusValues }),
}, { versionKey: false, timestamps: false });

const MealStatusModel: Model<IMealStatus> = dalgeurakDB.model('mealstatus', mealStatusSchema);

export {
  mealStatusSchema,
  MealStatusModel,
};
