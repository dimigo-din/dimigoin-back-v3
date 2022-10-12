import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { NightTimeValues } from '../types';
import { getTodayDateString } from '../resources/date';

const ingangApplicationSchema = createSchema({
  applier: Type.number({ required: true }),
  time: Type.string({ required: true, enum: NightTimeValues }),
  date: Type.string({ required: true, default: getTodayDateString() }),
}, { versionKey: false, timestamps: true });

export type IngangApplicationDoc = ExtractDoc<typeof ingangApplicationSchema>;

const IngangApplicationModel = typedModel('IngangApplication', ingangApplicationSchema);

export {
  ingangApplicationSchema,
  IngangApplicationModel,
};
