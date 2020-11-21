import Joi from 'joi';
import { Controller } from '../classes';
import { validator } from '../middlewares';
import {
  identifyUser,
} from '../controllers/auth';
import wrapper from '../resources/wrapper';

class AuthController extends Controller {
  public basePath = '/auth';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validator(Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })), wrapper(identifyUser));
  }
}

export default AuthController;
