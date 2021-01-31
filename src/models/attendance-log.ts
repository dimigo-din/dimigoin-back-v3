import { createSchema, Type, typedModel } from 'ts-mongoose';
import * as User from './user';
import { placeSchema } from './place';

const attendanceLogSchema = createSchema({
  date: Type.date({ required: true }),
  student: Type.ref(Type.objectId()).to('User', User.schema),
  remark: Type.string({ required: true, trim: true }),
  place: Type.ref(Type.objectId()).to('Place', placeSchema),
}, { versionKey: false, timestamps: true });

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema);

export {
  attendanceLogSchema,
  AttendanceLogModel,
};
