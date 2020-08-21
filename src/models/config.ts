import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';

const configSchema = createSchema({
  key: Type.string({ required: true, trim: true, unique: true }),
  value: Type.mixed(),
}, { versionKey: false, timestamps: true });

type ConfigDoc = ExtractDoc<typeof configSchema>;

const ConfigModel = typedModel('Config', configSchema, undefined, undefined, {
  findByKey(key: string): ConfigDoc {
    return this.find({ key });
  },
});

export {
  configSchema,
  ConfigModel,
};
