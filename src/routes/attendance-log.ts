import Joi from 'joi';
import { checkUserType, validator } from '../middlewares';
import { Controller } from '../classes';
import {
  getClassStatus,
  createAttendanceLog,
} from '../controllers/attendance-log';
import wrapper from '../resources/wrapper';

class AttendanceLogController extends Controller {
  public basePath = '/attendance-log';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/class-status',
      checkUserType('S'),
      validator(Joi.object({
        grade: Joi.number().required(),
        class: Joi.number().required(),
        date: Joi.date().required(),
      })),
      wrapper(getClassStatus));
    this.router.post('/', checkUserType('S'), validator(Joi.object({
      place: Joi.string().required(),
      remark: Joi.string().required(),
    })), wrapper(createAttendanceLog));
  }
}

export default AttendanceLogController;
