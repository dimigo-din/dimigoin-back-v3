import { Request, Response } from 'express';
import * as Config from '../../models/config';

export const getAllConfig = async (req: Request, res: Response) => {
  res.json({ config: await Config.getEntire() });
};

export const editConfig = async (req: Request, res: Response) => {
  const newConfig = req.body;
  const config = await Config.model.findOne({ key: newConfig.key });
  if (config) {
    config.value = newConfig.value;
    await config.save();
  } else {
    const _newConfig = new Config.model();
    Object.assign(_newConfig, newConfig);
    await _newConfig.save();
  }
  res.json({
    key: config.key,
    value: config.value,
  });
};
