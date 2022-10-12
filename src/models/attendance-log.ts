import { createSchema, Type, typedModel } from 'ts-mongoose';
import { placeSchema } from './place';

const attendanceLogSchema = createSchema({
  date: Type.string({ required: true }),
  student: Type.number({ required: true }),
  remark: Type.string({ trim: true, default: null }),
  place: Type.ref(Type.objectId()).to('Place', placeSchema),
  updatedBy: Type.number({ required: true }),
}, { versionKey: false, timestamps: true });

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema);

export {
  attendanceLogSchema,
  AttendanceLogModel,
};
