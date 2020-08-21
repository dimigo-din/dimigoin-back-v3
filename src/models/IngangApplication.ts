import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { userSchema } from './User';
import { IngangTimeValues } from '../types'
import { getOnlyDate } from '../resources/date'

const ingangApplicationSchema = createSchema({
  applier: Type.ref(Type.objectId({ required: true })).to('User', userSchema),
  time: Type.number({ required: true, enum: IngangTimeValues }),
  date: Type.date({ required: true, default: getOnlyDate() }),
}, { versionKey: false, timestamps: true });

type IngangApplicationDoc = ExtractDoc<typeof ingangApplicationSchema>;

const IngangApplicationModel = typedModel('IngangApplicationModel', ingangApplicationSchema);

export {
  ingangApplicationSchema,
  IngangApplicationModel,
};
