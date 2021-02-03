import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import { NightTimeValues, NightTime } from '../types';
import { getTodayDateString } from '../resources/date';

const ingangApplicationSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  time: Type.string({ required: true, enum: NightTimeValues }),
  date: Type.string({ required: true, default: getTodayDateString() }),
}, { versionKey: false, timestamps: true });

export type IngangApplicationDoc = ExtractDoc<typeof ingangApplicationSchema>;

const IngangApplicationModel = typedModel('IngangApplication', ingangApplicationSchema, undefined, undefined, {
  async checkDuplicatedApplication(applier: ObjectId, date: string, time: NightTime) {
    return !!(await IngangApplicationModel.findOne({
      applier,
      time,
      date,
    }));
  },
});

export {
  ingangApplicationSchema,
  // IngangApplicationDoc,
  IngangApplicationModel,
};
