import { NextFunction, Request, Response } from 'express';
import { IConfig } from '../interfaces';
import { ConfigModel } from '../models';
import { getEntireConfig } from '../resources/config';

export const getAllConfig = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ config: await getEntireConfig() });
};

export const editConfig = async (req: Request, res: Response, next: NextFunction) => {
  const newConfig: IConfig = req.body;
  const config = await ConfigModel.findOne({ key: newConfig.key });
  if (config) {
    config.value = newConfig.value;
    await config.save();
  } else {
    const _newConfig = new ConfigModel();
    Object.assign(_newConfig, newConfig);
    await _newConfig.save();
  }
  res.json({
    key: config.key,
    value: config.value,
  });
};
