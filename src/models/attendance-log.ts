import { createSchema, Type, typedModel } from 'ts-mongoose';
import * as User from './user';
import * as Place from './place';

export const schema = createSchema({
  date: Type.date({ required: true }),
  student: Type.ref(Type.objectId()).to('User', User.schema),
  remark: Type.string({ required: true, trim: true }),
  place: Type.ref(Type.objectId()).to('Place', Place.schema),
}, { versionKey: false, timestamps: true });

export const model = typedModel('AttendanceLog', schema);
