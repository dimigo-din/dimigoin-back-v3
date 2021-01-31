import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';
import { ConfigKeys } from '../types';

export const schema = createSchema({
  key: Type.string({ required: true, trim: true, unique: true }),
  value: Type.mixed(),
}, { versionKey: false, timestamps: true });
export type doc = ExtractDoc<typeof schema>;
export const model = typedModel('Config', schema);

const getValueByKey = async (key: ConfigKeys): Promise<any> => {
  return (await model.findOne({ key })).value;
};

interface EntireConfigs {
  [key: string]: any;
}

const getEntire = async () => {
  const configs = await model.find({});
  const reduedConfigs: EntireConfigs = configs.reduce(
    (acc, config) => ({
      ...acc,
      [config.key]: config.value,
    }),
    {},
  );
  return reduedConfigs;
};

export {
  getValueByKey,
  getEntire,
};
