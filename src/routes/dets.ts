import Joi from 'joi';
import { Controller } from '../classes';
import { validator, checkUserType } from '../middlewares';
import {
  getDetsList, getDets, createDets, editDets, applyDets,
} from '../controllers/dets';
import wrapper from '../resources/wrapper';
import attachUserinfo from '../middlewares/attach-user-info';

class DetsController extends Controller {
  public basePath = '/dets';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', checkUserType('*'), wrapper(getDetsList));

    this.router.get('/:detsId', checkUserType('*'), wrapper(getDets));

    this.router.post('/', checkUserType('T', 'S'), validator(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      requestEndDate: Joi.date().required(),
      time: Joi.string().required(),
      speakerID: Joi.string().required(),
      day: Joi.string().required(),
      room: Joi.string().required(),
      maxCount: Joi.number().required(),
      targetGrade: Joi.array().items(Joi.number()).required(),
      imageUrl: Joi.string().required(),
    })), wrapper(createDets));

    this.router.post('/apply/:detsId', checkUserType('S'), attachUserinfo, applyDets);

    this.router.patch('/:detsId', checkUserType('T', 'S'), attachUserinfo, validator(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      requestEndDate: Joi.date().required(),
      time: Joi.string().required(),
      speakerID: Joi.string().required(),
      day: Joi.string().required(),
      room: Joi.string().required(),
      maxCount: Joi.number().required(),
      targetGrade: Joi.array().items(Joi.number()).required(),
      imageUrl: Joi.string().required(),
    })), wrapper(editDets));
  }
}

export default DetsController;
