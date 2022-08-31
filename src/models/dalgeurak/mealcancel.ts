import { ObjectId } from 'mongodb';
import { Model, Document } from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import {
  MealCancelApplicationStatusValues,
  MealTimeValues,
  MealTimeType,
  MealCancelApplicationStatus,
} from '../../types';
import { userSchema } from '../user';

interface IMealCancel extends Document {
  applier: ObjectId;
  reason: string;
  applicationStatus: MealCancelApplicationStatus;
  duration: {
    start: string;
    end: string;
  };
  time: MealTimeType;
}

const mealCancelSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
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
