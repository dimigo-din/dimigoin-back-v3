import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import { NightTimeValues } from '../types';
import {
  getIngangStatus,
  getAllIngangApplications,
  createIngangApplication,
  removeIngangApplication,
} from '../controllers/ingang-application';
import wrapper from '../resources/wrapper';

class IngangApplicationController extends Controller {
  public basePath = '/ingang-application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('T', 'S'), wrapper(getAllIngangApplications));

    this.router.get('/status', checkUserType('S'), wrapper(getIngangStatus));

    this.router.post('/', checkUserType('S'), validator(Joi.object({
      time: Joi.string().valid(...NightTimeValues).required(),
    })), wrapper(createIngangApplication));

    this.router.delete('/', checkUserType('S'), validator(Joi.object({
      time: Joi.string().valid(...NightTimeValues).required(),
    })), wrapper(removeIngangApplication));
  }
}

export default IngangApplicationController;
