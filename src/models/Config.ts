import { createSchema, Type, typedModel } from 'ts-mongoose';

const configSchema = createSchema({
  key: Type.string({ required: true, trim: true, unique: true }),
  value: Type.mixed(),
}, { versionKey: false, timestamps: true });

const ConfigModel = typedModel('Config', configSchema);

export {
  configSchema,
  ConfigModel,
};
