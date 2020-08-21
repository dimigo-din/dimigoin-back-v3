import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import { IngangTimeValues } from '../types';
import {
  getAllIngangApplications,
  createIngangApplication,
  removeIngangApplication,
} from '../controllers/ingang-application';

class CircleApplicationController extends Controller {
  public basePath = '/ingang/application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('T', 'S'), getAllIngangApplications);

    this.router.post('/', checkUserType('S'), validator(Joi.object({
      time: Joi.number().valid(...IngangTimeValues).required(),
    })), createIngangApplication);

    this.router.delete('/', checkUserType('S'), validator(Joi.object({
      time: Joi.number().valid(...IngangTimeValues).required(),
    })), removeIngangApplication);
  }
}

export default CircleApplicationController;
