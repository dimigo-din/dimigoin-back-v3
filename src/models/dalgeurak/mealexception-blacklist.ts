import { createSchema, Type } from 'ts-mongoose';
import { Document, Model } from 'mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

export interface MealExceptionBlacklist extends Document {
  userId: number;
}
const mealExceptionBlacklistScheme = createSchema({
  userId: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const MealExceptionBlacklistModel: Model<MealExceptionBlacklist> = dalgeurakDB.model('convenienceacheckin', mealExceptionBlacklistScheme);

export {
  mealExceptionBlacklistScheme,
  MealExceptionBlacklistModel,
};
