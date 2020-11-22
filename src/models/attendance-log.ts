import { createSchema, Type, typedModel } from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import { NightTimeValues, NightTime } from '../types';
import { getOnlyDate } from '../resources/date';
import { placeSchema } from './place';

const attendanceLogSchema = createSchema({
  date: Type.date({ required: true }),
  student: Type.ref(Type.objectId()).to('User', userSchema),
  remark: Type.string({ required: true, trim: true }),
  time: Type.string({ required: true, enum: NightTimeValues }),
  place: Type.ref(Type.objectId()).to('Place', placeSchema),
});

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema, undefined, undefined, {
  async checkDuplicatedLog(student: ObjectId, date: Date, time: NightTime) {
    date = getOnlyDate(date);
    return !!(await this.findOne({
      student,
      time,
      date,
    }));
  },
});

export {
  attendanceLogSchema,
  AttendanceLogModel,
};
