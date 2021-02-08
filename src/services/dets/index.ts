import Joi from 'joi';
import { Service } from '../index';
import * as controllers from './controllers';

export default {
  name: '뎃츠 서비스',
  baseURL: '/dets',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getDetsList,
    },
    {
      method: 'get',
      path: '/:detsId',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getDets,
    },
    {
      method: 'delete',
      path: '/:detsId',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getDets,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['S'],
      validateSchema: {
        title: Joi.string().required(),
        description: Joi.string().required(),
        requestEndDate: Joi.date().required(),
        time: Joi.string().required(),
        speakerID: Joi.string().required(),
        day: Joi.string().required(),
        room: Joi.string().required(),
        maxCount: Joi.number().required(),
        targetGrade: Joi.array().items(Joi.number()).required(),
        imageUrl: Joi.string().required(),
        duration: Joi.object({
          start: Joi.date().required(),
          end: Joi.date().required(),
        }).required(),
      },
      handler: controllers.createDets,
    },
    {
      method: 'patch',
      path: '/:detsId',
      allowedUserTypes: ['S'],
      validateSchema: {
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
      },
      handler: controllers.editDets,
    },
  ],
} as Service;