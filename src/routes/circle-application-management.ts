import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getApplicationForm,
  updateApplicationForm,
  getAllApplications,
} from '../controllers/circle-application-management';

class CircleApplicationManagementController extends Controller {
  public basePath = '/circle';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/application/form', checkUserType('S', 'T'), getApplicationForm);

    this.router.put('/application/form', checkUserType('T'), validator(Joi.object({
      form: Joi.object().required(),
    })), updateApplicationForm);

    this.router.get('/applier', checkUserType('T'), getAllApplications);
  }
}

export default CircleApplicationManagementController;
