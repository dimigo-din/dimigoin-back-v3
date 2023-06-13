import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';

import { staySchema } from './stay';

const stayApplicationSchema = createSchema({
  stay: Type.ref(Type.objectId()).to('Stay', staySchema),
  seat: Type.string({ required: true }),
  user: Type.number({ required: true }),
  reason: Type.string({ required: false }),

}, { versionKey: false, timestamps: true });

const StayApplicationModel = typedModel('StayApplication', stayApplicationSchema);

export {
  stayApplicationSchema,
  StayApplicationModel,
};
