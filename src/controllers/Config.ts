import { NextFunction, Request, Response } from 'express';
import { IConfig } from '../interfaces';
import { Controller } from '../classes';
import { ConfigModel } from '../models';
import Route from '../resources/RouteGenerator';

class ConfigController extends Controller {
  public basePath = '/config';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', Route('A', '', this.getAllConfig));
    this.router.patch('/', Route(['T'], this.requiredKeys.editConfig, this.editConfig));
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
