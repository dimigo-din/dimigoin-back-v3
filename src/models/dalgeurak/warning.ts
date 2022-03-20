import { createSchema, Type } from 'ts-mongoose';
import { dalgeurakDB } from '../../resources/dalgeurakDB';
import { userSchema } from '../user';

const warningSchema = createSchema({
  student: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  type: Type.array({ required: true }).of(Type.string()),
  reason: Type.string({ required: true }),
  date: Type.string({ required: true }),
}, { versionKey: false, timestamps: true });

const WarningModel = dalgeurakDB.model('warning', warningSchema);

export {
  warningSchema,
  WarningModel,
};
