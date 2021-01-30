import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import * as User from './user';
import { NightTimeValues, NightTime } from '../types';
import { getOnlyDate, getWeekStart, getWeekEnd } from '../resources/date';
import { ObjectID } from 'mongodb';

export const schema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', User.schema),
  time: Type.string({ required: true, enum: NightTimeValues }),
  date: Type.date({ required: true, default: getOnlyDate(new Date()) }),
}, { versionKey: false, timestamps: true });

export type IngangApplicationDoc = ExtractDoc<typeof schema>;

export const model = typedModel('IngangApplicationModel', schema);

const checkDuplicatedApplication = async (applier: ObjectId, date: Date, time: NightTime) => {
  date = getOnlyDate(date);
  return !!(await model.findOne({
    applier,
    time,
    date,
  }));
};

const getWeeklyUsedTicket = async (applier: ObjectID) => {
  return await model.countDocuments({
    applier,
    date: {
      $gte: getWeekStart(new Date()),
      $lte: getWeekEnd(new Date()),
    },
  });
};

const getApplicationsByClass = async (grade: number, klass: number) => {
  return (await model
    .find({ date: getOnlyDate(new Date()) })
    .populateTs('applier'))
    .filter((application) => (
      application.applier.grade === grade
      && application.applier.class === klass
    ));
};

export {
  checkDuplicatedApplication,
  getWeeklyUsedTicket,
  getApplicationsByClass,
};
