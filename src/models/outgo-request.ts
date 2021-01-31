import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';
import { OutgoRequestStatus } from '../types';
import * as User from './user';

export const schema = createSchema({
  applier: Type.array({ required: true })
    .of(Type.ref(Type.objectId({ required: true })).to('User', User.schema)),
  approver: Type.ref(Type.objectId({ required: true })).to('User', User.schema),
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

export const model = typedModel('OutgoRequest', schema);
