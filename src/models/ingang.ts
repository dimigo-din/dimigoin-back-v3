import {
  createSchema, ExtractDoc, Type, typedModel,
} from 'ts-mongoose';
import { userSchema } from '.';

export const ingangSchema = createSchema(
  {
    date: Type.date({ default: new Date() }),
    applier: Type.ref(Type.objectId()).to('User', userSchema),
    time: Type.number({ required: true, enum: [1, 2] }),
  },
  { versionKey: false, timestamps: true },
);

export type ingangDoc = ExtractDoc<typeof ingangSchema>;
export const ingangModel = typedModel(
  'Ingang',
  ingangSchema,
);
