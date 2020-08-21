import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { IConfig } from '../interfaces';
import { Controller } from '../classes';
import { ConfigModel } from '../models';
import { validator } from '../middlewares';

class ConfigController extends Controller {
  public basePath = '/config';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // A
    this.router.get('/', this.getAllConfig);

    // T
    this.router.patch('/', validator(Joi.object({
      key: Joi.string().required(),
      value: Joi.string().required(),
    })), this.editConfig);
  }

  private getAllConfig = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ config: await this.config });
  }

  private editConfig = async (req: Request, res: Response, next: NextFunction) => {
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
  }
}

export default ConfigController;
