import { ConfigModel } from '../models/config';
import { MealConfigModel } from '../models/dalgeurak';

export const getConfig = async (key: string) =>
  (await ConfigModel.findByKey(key)).value;

interface EntireConfigs {
  [key: string]: any;
}

export const getEntireConfigs = async () => {
  const configs = await ConfigModel.find({});
  const reduedConfigs: EntireConfigs = configs.reduce(
    (acc, config) => ({
      ...acc,
      [config.key]: config.value,
    }),
    {},
  );
  return reduedConfigs;
};

export const getMealConfig = async (key: string) =>
  (await MealConfigModel.findOne({ key })).value;
