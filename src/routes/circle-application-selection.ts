import Joi from 'joi';
import { Controller } from '../classes';
import { CircleApplicationStatusValues } from '../types';
import { validator, checkUserType } from '../middlewares';
import {
  getApplications,
  setApplierStatus,
} from '../controllers/circle-application-selection';

class CircleApplierSelection extends Controller {
  public basePath = '/circle/selection/applier';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S'), getApplications);

    this.router.patch('/:applierId', checkUserType('S'), validator(Joi.object({
      status: Joi.string().valid(...CircleApplicationStatusValues).required(),
    })), setApplierStatus);
  }
}

export default CircleApplierSelection;
