import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import {
  MealCancelApplicationStatusValues,
  MealTimeValues,
  MealTimeType,
  MealCancelApplicationStatus,
} from '../../types';

interface IMealCancel extends Document {
  applier: number;
  reason: string;
  applicationStatus: MealCancelApplicationStatus;
  duration: {
    start: string;
    end: string;
  };
  time: MealTimeType;
}

const mealCancelSchema = createSchema({
  applier: Type.number({ required: true }),
  reason: Type.string({ required: true }),
  applicationStatus: Type.string({ required: true, enum: MealCancelApplicationStatusValues, default: 'teacherWaiting' }),
  duration: Type.object({ required: true }).of({
    start: Type.string({ required: true }),
    end: Type.string({ required: true }),
  }),
  time: Type.array({ required: true }).of(Type.string({ enum: MealTimeValues })),
}, { versionKey: false, timestamps: true });

const MealCancelModel: Model<IMealCancel> = dalgeurakDB.model('mealcancel', mealCancelSchema);

export {
  mealCancelSchema,
  MealCancelModel,
};
