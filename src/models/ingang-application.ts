import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import { IngangTime, IngangTimeValues } from '../types';
import { getOnlyDate } from '../resources/date';

const ingangApplicationSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  time: Type.number({ required: true, enum: IngangTimeValues }),
  date: Type.date({ required: true, default: getOnlyDate(new Date()) }),
}, { versionKey: false, timestamps: true });

type IngangApplicationDoc = ExtractDoc<typeof ingangApplicationSchema>;

const IngangApplicationModel = typedModel('IngangApplicationModel', ingangApplicationSchema, undefined, undefined, {
  async checkDuplicatedApplication(applier: ObjectId, date: Date, time: IngangTime) {
    date = getOnlyDate(date);
    return !!(await this.findOne({
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
