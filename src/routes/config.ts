import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getAllConfig,
  editConfig,
} from '../controllers/config';
import wrapper from '../resources/wrapper';

class ConfigController extends Controller {
  public basePath = '/config';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', wrapper(getAllConfig));

    this.router.put('/', checkUserType('T', 'S'), validator(Joi.object({
      key: Joi.string().required(),
      value: Joi.any().required(),
    })), wrapper(editConfig));
  }
}

export default ConfigController;
