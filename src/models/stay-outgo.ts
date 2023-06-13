import { createSchema, Type, typedModel } from 'ts-mongoose';
import { StayOutgoStatusValues } from '../types';

import { staySchema } from './stay';

const stayOutgoSchema = createSchema({
  stay: Type.ref(Type.objectId()).to('Stay', staySchema),
  user: Type.number({ required: true }),
  status: Type.string({ required: true, enum: StayOutgoStatusValues }),
  date: Type.date({ required: true }),
  duration: Type.object({ required: true }).of({
    start: Type.date({ required: true }),
    end: Type.date({ required: true }),
  }),
  breakfast: Type.boolean({ required: true }),
  lunch: Type.boolean({ required: true }),
  dinner: Type.boolean({ required: true }),
  reason: Type.string({ required: true }),
}, { versionKey: false, timestamps: true });

const StayOutgoModel = typedModel('StayOutgo', stayOutgoSchema);

export {
  stayOutgoSchema, StayOutgoModel,
};
