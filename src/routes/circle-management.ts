import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  createCircle,
  removeCircle,
} from '../controllers/circle-management';

class CircleManagementController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', checkUserType('S', 'T'), validator(Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      chair: Joi.string().required(),
      viceChair: Joi.string().required(),
      videoLink: Joi.string().required(),
    })), createCircle);

    this.router.delete('/:circleId', checkUserType('T'), removeCircle);
  }
}

export default CircleManagementController;
