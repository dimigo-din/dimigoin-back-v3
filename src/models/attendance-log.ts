import { createSchema, Type, typedModel } from 'ts-mongoose';
import { ObjectId } from 'mongodb';
import { userSchema } from './user';
import { IngangTime } from '../types';
import { getOnlyDate } from '../resources/date';
import { placeSchema } from './place';

const attendanceLogSchema = createSchema({
  date: Type.date({ required: true }),
  student: Type.ref(Type.objectId()).to('User', userSchema),
  remark: Type.string({ required: true, trim: true }),
  time: Type.number({ required: true, enum: [1, 2] }),
  location: Type.ref(Type.objectId()).to('Place', placeSchema),
});

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema, undefined, undefined, {
  checkDuplicatedLog(student: ObjectId, date: Date, time: IngangTime) {
    date = getOnlyDate(date);
    return !!this.findOne({
      student,
      time,
      date,
    });
  },
});

export {
  attendanceLogSchema,
  AttendanceLogModel,
};
