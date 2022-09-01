import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';

interface IMealConfig extends Document {
  key: string;
  value: any;
}

const mealConfigSchema = createSchema({
  key: Type.string({ required: true, trim: true, unique: true }),
  value: Type.mixed({ required: true }),
}, { versionKey: false, timestamps: false });

const MealConfigModel: Model<IMealConfig> = dalgeurakDB.model('mealconfig', mealConfigSchema);

export {
  mealConfigSchema,
  MealConfigModel,
};
