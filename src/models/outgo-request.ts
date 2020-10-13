import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';
import { OutgoRequestStatus } from '../types';

const outgoRequestSchema = createSchema({
  applier: Type.array({ required: true }).of(Type.objectId()),
  approver: Type.objectId({ required: true }),
  reason: Type.string({ required: true }),
  detailReason: Type.string({ default: '' }),
  duration: Type.object({ required: true }).of({
    start: Type.date({ required: true }),
    end: Type.date({ required: true }),
  }),
  status: Type.string({
    required: true,
    enum: Object.values(OutgoRequestStatus),
    default: OutgoRequestStatus.applied,
  }),
});

const OutgoRequestModel = typedModel('OutgoRequest', outgoRequestSchema);

export {
  outgoRequestSchema,
  OutgoRequestModel,
};
