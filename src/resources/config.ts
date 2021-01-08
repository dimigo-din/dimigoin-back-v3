import { ConfigModel } from '../models/config';

export const getConfig = async (key: string) =>
  (await ConfigModel.findByKey(key)).value;

export const getEntireConfig = async () => {
  const config: {
    [key: string]: any;
  } = {};
  (await ConfigModel.find({})).forEach((v) => {
    config[v.key] = v.value;
  });
  return config;
};
