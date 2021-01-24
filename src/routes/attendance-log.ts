import Joi from 'joi';
import { checkUserType, validator } from '../middlewares';
import { Controller } from '../classes';
import {
  getClassStatus,
  createAttendanceLog,
  myAttendanceStatus,
} from '../controllers/attendance-log';
import wrapper from '../resources/wrapper';

class AttendanceLogController extends Controller {
  public basePath = '/attendance-log';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/class-status/date/:date/grade/:grade/class/:class',
      checkUserType('S', 'T'),
      wrapper(getClassStatus),
    );
    this.router.get('/my-status',
      checkUserType('S'),
      wrapper(myAttendanceStatus));
    this.router.post('/',
      checkUserType('S'),
      validator(Joi.object({
        place: Joi.string().required(),
        remark: Joi.string().required(),
      })),
      wrapper(createAttendanceLog));
  }
}

export default AttendanceLogController;
