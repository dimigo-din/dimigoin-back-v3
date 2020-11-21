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

class NoticeController extends Controller {
  public basePath = '/notice';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), getAllNotices);

    this.router.get('/current', checkUserType('*'), getCurrentNotices);

    this.router.get('/:noticeId', checkUserType('*'), getNotice);

    this.router.post('/', checkUserType('T', 'S'), validator(Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      targetGrade: Joi.array().items(Joi.number()).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
    })), createNotice);

    this.router.patch('/:noticeId', checkUserType('T', 'S'), validator(Joi.object({
      title: Joi.string(),
      content: Joi.string(),
      targetGrade: Joi.array().items(Joi.number()),
      startDate: Joi.date(),
      endDate: Joi.date(),
    })), editNotice);
  }
}

export default NoticeController;
