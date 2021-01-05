import { ConfigModel } from '../models/config';
import { ConfigKeys, CirclePeriod } from '../types';

// Config 기본값 설정
const defaultConfig: any = {
  [ConfigKeys.circlePeriod]: CirclePeriod.application,
  [ConfigKeys.circleMaxApply]: 3,
  [ConfigKeys.circleCategory]: ['IT(프로젝트)', '음악', '경영'],
  [ConfigKeys.imageExtension]: ['png', 'jpg', 'jpeg', 'heif'],
  [ConfigKeys.weeklyIngangTicketCount]: 6,
};

(async () => {
  const keys = Object.values(ConfigKeys);
  const configDocs = await ConfigModel.find({});
  /* eslint-disable */
  for (const key of keys) {
    if (configDocs.find((d) => d.key === key)) continue;
    await new ConfigModel({
      key,
      value: defaultConfig[key],
    }).save();
    /* eslint-enable */
  }
})();

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
