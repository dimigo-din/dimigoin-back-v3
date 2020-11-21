import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getApplicationStatus,
  createApplication,
  finalSelection,
} from '../controllers/circle-application';
import wrapper from '../resources/wrapper';

class CircleApplicationController extends Controller {
  public basePath = '/circle/application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S'), wrapper(getApplicationStatus));

    this.router.post('/', checkUserType('S'), validator(Joi.object({
      circle: Joi.string().required(),
      form: Joi.object().required(),
    })), wrapper(createApplication));

    this.router.patch('/final/:circleId', checkUserType('S'), wrapper(finalSelection));
  }
}

export default CircleApplicationController;
