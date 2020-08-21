import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getApplicationStatus,
  createApplication,
  finalSelection,
} from '../controllers/circle-application';

class CircleApplicationController extends Controller {
  public basePath = '/circle/application';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S'), getApplicationStatus);

    this.router.post('/', checkUserType('S'), validator(Joi.object({
      circle: Joi.string().required(),
      form: Joi.object().required(),
    })), createApplication);

    this.router.patch('/final/:circleId', checkUserType('S'), finalSelection);
  }
}

export default CircleApplicationController;
