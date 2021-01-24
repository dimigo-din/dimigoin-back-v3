import Joi from 'joi';
import { Controller } from '../classes';
import { CircleApplicationStatusValues } from '../types';
import { validator, checkUserType } from '../middlewares';
import {
  getApplications,
  setApplierStatus,
} from '../controllers/circle-application-selection';
import wrapper from '../resources/wrapper';

class CircleApplierSelection extends Controller {
  public basePath = '/circle/selection/applier';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S'), wrapper(getApplications));

    this.router.patch('/:applierId', checkUserType('S'), validator(Joi.object({
      status: Joi.string().valid(...CircleApplicationStatusValues).required(),
    })), wrapper(setApplierStatus));
  }
}

export default CircleApplierSelection;
