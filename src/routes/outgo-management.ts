import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getAllOutgoRequests,
  getOutgoRequest,
  toggleOutgoRequestStatus,
} from '../controllers/outgo-management';
import wrapper from '../resources/wrapper';
import { OutgoRequestStatus } from '../types';

class OutgoManagementController extends Controller {
  public basePath = '/outgo-management';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('T'), wrapper(getAllOutgoRequests));
    this.router.get('/:outgoRequestId', checkUserType('T'), wrapper(getOutgoRequest));
    this.router.patch('/:outgoRequestId/toggle', checkUserType('T'), validator(Joi.object({
      status: Joi.string().valid(...Object.values(OutgoRequestStatus)).required(),
    })), wrapper(toggleOutgoRequestStatus));
  }
}

export default OutgoManagementController;
