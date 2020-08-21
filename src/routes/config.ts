import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getAllConfig,
  editConfig,
} from '../controllers/config';

class ConfigController extends Controller {
  public basePath = '/config';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), getAllConfig);

    this.router.patch('/', checkUserType('T'), validator(Joi.object({
      key: Joi.string().required(),
      value: Joi.string().required(),
    })), editConfig);
  }
}

export default ConfigController;
