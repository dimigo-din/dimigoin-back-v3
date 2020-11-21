import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getMyOutgoRequests,
  createOutgoRequest,
  editOutgoRequest,
} from '../controllers/outgo-request';
import wrapper from '../resources/wrapper';

class OutgoRequestController extends Controller {
  public basePath = '/outgo-request';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('S'), getMyOutgoRequests);
    this.router.post('/', checkUserType('S'), validator(Joi.object({
      applier: Joi.array().items(Joi.string()).required(),
      approver: Joi.string().required(),
      reason: Joi.string().required(),
      detailReason: Joi.string().default(''),
      duration: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().required(),
      }).required(),
    })), wrapper(createOutgoRequest));
    this.router.put('/:requestId', checkUserType('S', '*'), validator(Joi.object({
      applier: Joi.array().items(Joi.string()).required(),
      approver: Joi.string().required(),
      reason: Joi.string().required(),
      detailReason: Joi.string().default(''),
      duration: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().required(),
      }).required(),
    })), wrapper(editOutgoRequest));
  }
}

export default OutgoRequestController;
