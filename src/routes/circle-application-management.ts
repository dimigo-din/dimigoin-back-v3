import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getApplicationForm,
  updateApplicationForm,
  getAllApplications,
} from '../controllers/circle-application-management';
import wrapper from '../resources/wrapper';

class CircleApplicationManagementController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/application/form', checkUserType('S', 'T'), wrapper(getApplicationForm));

    this.router.put('/application/form', checkUserType('T'), validator(Joi.object({
      form: Joi.object().required(),
    })), wrapper(updateApplicationForm));

    this.router.get('/applier', checkUserType('T'), wrapper(getAllApplications));
  }
}

export default CircleApplicationManagementController;
