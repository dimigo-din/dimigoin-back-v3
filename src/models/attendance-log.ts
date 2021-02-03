import { createSchema, Type, typedModel } from 'ts-mongoose';
import { userSchema } from './user';
import { placeSchema } from './place';

const attendanceLogSchema = createSchema({
  date: Type.string({ required: true }),
  student: Type.ref(Type.objectId()).to('User', userSchema),
  remark: Type.string({ required: true, trim: true }),
  place: Type.ref(Type.objectId()).to('Place', placeSchema),
}, { versionKey: false, timestamps: true });

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema);

export {
  attendanceLogSchema,
  AttendanceLogModel,
};
