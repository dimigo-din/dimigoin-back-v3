import {
  createSchema, Type,
} from 'ts-mongoose';

import { staySchema } from './stay';

const stayApplicationSchema = createSchema({
  stay: Type.ref(Type.objectId()).to('Stay', staySchema),
  seat: Type.string({ required: true }),
  user: Type.number({ required: true }),
  reason: Type.string({ required: true }),

}, { versionKey: false, timestamps: true });

export {
  stayApplicationSchema,
};
