import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import { IngangTimeValues } from '../types';
import {
  getAllIngangApplications,
  createIngangApplication,
  removeIngangApplication,
} from '../controllers/ingang-application';
import wrapper from '../resources/wrapper';

class CircleApplicationController extends Controller {
  public basePath = '/ingang/application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('T', 'S'), wrapper(getAllIngangApplications));

    this.router.post('/', checkUserType('S'), validator(Joi.object({
      time: Joi.number().valid(...IngangTimeValues).required(),
    })), wrapper(createIngangApplication));

    this.router.delete('/', checkUserType('S'), validator(Joi.object({
      time: Joi.number().valid(...IngangTimeValues).required(),
    })), wrapper(removeIngangApplication));
  }
}

export default CircleApplicationController;
