import { createSchema, Type, typedModel } from 'ts-mongoose';
import { userSchema } from './user';

const placeSchema = createSchema({
  name: Type.string({ required: true, trim: true }),
  location: Type.string({ required: true, trim: true }),
  description: Type.string({ required: true, trim: true }),
});

const PlaceModel = typedModel('Place', placeSchema);

const attendanceLogSchema = createSchema({
  date: Type.date({ required: true }),
  student: Type.ref(Type.objectId()).to('User', userSchema),
  remark: Type.string({ required: true, trim: true }),
  time: Type.number({ required: true, enum: [1, 2] }),
  location: Type.ref(Type.objectId()).to('Place', placeSchema),
});

const AttendanceLogModel = typedModel('AttendanceLog', attendanceLogSchema);

export {
  placeSchema,
  PlaceModel,
  attendanceLogSchema,
  AttendanceLogModel,
};
