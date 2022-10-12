import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { WarningValues } from '../../types';

const warningSchema = createSchema({
  student: Type.number({ required: true }),
  type: Type.array({ required: true }).of(Type.string({ enum: WarningValues })),
  reason: Type.string({ required: true }),
  date: Type.string({ required: true }),
}, { versionKey: false, timestamps: true });

const WarningModel = dalgeurakDB.model('warning', warningSchema);

export {
  warningSchema,
  WarningModel,
};
