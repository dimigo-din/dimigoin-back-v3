import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';
import { OutgoRequestStatus } from '../types';
import { userSchema } from './user';

const outgoRequestSchema = createSchema({
  applier: Type.array({ required: true })
    .of(Type.ref(Type.objectId({ required: true })).to('User', userSchema)),
  approver: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
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
}, { versionKey: false, timestamps: true });

const OutgoRequestModel = typedModel('OutgoRequest', outgoRequestSchema);

export {
  outgoRequestSchema,
  OutgoRequestModel,
};
