import Joi from 'joi';
import * as controllers from './controllers';
import { AfterschoolTimeValues, DayValues } from '../../types';

export default {
  name: '방과후 수업 서비스',
  baseURL: '/afterschool',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getAllAfterschools,
    },
    {
      method: 'get',
      path: '/:afterschoolId',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getAfterschool,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['T'],
      validateSchema: {
        name: Joi.string().required(),
        description: Joi.string().required(),
        grade: Joi.array().items(Joi.number()).required(),
        class: Joi.array().items(Joi.number()).required(),
        key: Joi.string(),
        teacher: Joi.string().required(),
        day: Joi.array().items(Joi.string().valid(...DayValues)).required(),
        time: Joi.array().items(Joi.string().valid(...AfterschoolTimeValues)).required(),
        capacity: Joi.number().required(),
      },
      handler: controllers.createAfterschool,
    },
  ],
};
