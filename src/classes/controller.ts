import { Request, Router } from 'express';
import { IConfig } from '../interfaces';
import { ConfigModel } from '../models';
import IUser from '../interfaces/User';
import { verify as verifyToken } from '../resources/token'

const getUserIdentity = async (req: Request) => {
  const { token } = req;
  const identity = await verifyToken(token);
  return identity as IUser;
};

export default class Controller {
  public basePath: string;

  public router: Router = Router();

  protected getUserIdentity = getUserIdentity;

  get config() { // eslint-disable-line
    return (async () => {
      const config: IConfig = {};
      const configs = await ConfigModel.find();
      configs.forEach((v) => {
        config[v.key] = v.value;
      });
      return config;
    })();
  }
}
