import { Request, Router } from 'express';
import { IConfig } from '../interfaces';
import { ConfigModel } from '../models';
import Token from '../resources/Token';
import IUser from '../interfaces/User';

const TokenManager = new Token();

const getUserIdentity = (req: Request) => {
  const { token } = req;
  const identity = TokenManager.verify(token);
  return identity as IUser;
};

enum requiredKeys {
  none = '',
  identifyUser = 'username, password',
  createApplication = 'circle, form',
  updateApplicationForm = 'form',
  setApplierStatus = 'status',
  createCircle = 'name, category, description, chair, viceChair, videoLink',
  editConfig = 'key, value',
  createAfterschool = 'name, description, grade, '
    + 'class, teacher, capacity',
}

export default class Controller {
  public basePath: string;

  public router: Router = Router();

  protected getUserIdentity = getUserIdentity;

  protected requiredKeys = requiredKeys;

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
