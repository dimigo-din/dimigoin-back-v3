import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getAllNotices,
  getCurrentNotices,
  getNotice,
  editNotice,
  createNotice,
} from '../controllers/notice';
import wrapper from '../resources/wrapper';

class NoticeController extends Controller {
  public basePath = '/notice';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), wrapper(getAllNotices));

    this.router.get('/current', checkUserType('*'), wrapper(getCurrentNotices));

    this.router.get('/:noticeId', checkUserType('*'), wrapper(getNotice));

    this.router.post('/', checkUserType('T', 'S'), validator(Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      targetGrade: Joi.array().items(Joi.number()).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
    })), wrapper(createNotice));

    this.router.patch('/:noticeId', checkUserType('T', 'S'), validator(Joi.object({
      title: Joi.string(),
      content: Joi.string(),
      targetGrade: Joi.array().items(Joi.number()),
      startDate: Joi.date(),
      endDate: Joi.date(),
    })), wrapper(editNotice));
  }
}

export default NoticeController;
