import {
  createSchema, Type, typedModel,
} from 'ts-mongoose';
import { OutgoRequestStatus } from '../types';
import { userSchema } from './user';
import { notEmptyArray } from '../resources/model-validators';

const outgoRequestSchema = createSchema({
  applier: Type.array({ required: true, validate: notEmptyArray })
    .of(Type.ref(Type.objectId()).to('User', userSchema)),
  approver: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  reason: Type.string({ required: true }),
  detailReason: Type.string({ default: null }),
  duration: Type.object({ required: true }).of({
    // 시간 관련 정보도 필요하므로 Date Object 사용
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
