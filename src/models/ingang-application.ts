import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import { NightTimeValues, NightTime } from '../types';
import { getOnlyDate } from '../resources/date';

const ingangApplicationSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  time: Type.string({ required: true, enum: NightTimeValues }),
  date: Type.date({ required: true, default: getOnlyDate(new Date()) }),
}, { versionKey: false, timestamps: true });

type IngangApplicationDoc = ExtractDoc<typeof ingangApplicationSchema>;

const IngangApplicationModel = typedModel('IngangApplication', ingangApplicationSchema, undefined, undefined, {
  async checkDuplicatedApplication(applier: ObjectId, date: Date, time: NightTime) {
    date = getOnlyDate(date);
    return !!(await IngangApplicationModel.findOne({
      applier,
      time,
      date,
    }));
  },
});

export {
  ingangApplicationSchema,
  IngangApplicationModel,
};
