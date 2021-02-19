import { createSchema, Type, typedModel } from 'ts-mongoose';
import { userSchema } from './user';
import { placeSchema } from './place';

const attendanceLogSchema = createSchema({
  date: Type.string({ required: true }),
  student: Type.ref(Type.objectId()).to('User', userSchema),
  remark: Type.string({ trim: true, default: null }),
  place: Type.ref(Type.objectId()).to('Place', placeSchema),
  updatedBy: Type.ref(Type.objectId({ required: true, default: null })).to('User', userSchema),
}, { versionKey: false, timestamps: true });

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema);

export {
  attendanceLogSchema,
  AttendanceLogModel,
};
