import Joi from 'joi';
import { validator, checkUserType } from '../middlewares';
import { Controller } from '../classes';
import {
  getAfterschools,
  getAfterschool,
  createAfterschool,
} from '../controllers/afterschool';
import wrapper from '../resources/wrapper';
import { AfterschoolTimeValues, DayValues } from '../types';

class AfterschoolController extends Controller {
  public basePath = '/afterschool';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S', 'T'), wrapper(getAfterschools));
    this.router.get('/:afterschoolId', checkUserType('S', 'T'), wrapper(getAfterschool));
    this.router.post('/', checkUserType('T'), validator(Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      grade: Joi.array().items(Joi.number()).required(),
      class: Joi.array().items(Joi.number()).required(),
      key: Joi.string(),
      teacher: Joi.string().required(),
      day: Joi.string().valid(...DayValues).required(),
      time: Joi.string().valid(...AfterschoolTimeValues).required(),
      capacity: Joi.number().required(),
    })), wrapper(createAfterschool));
  }
}

export default AfterschoolController;
