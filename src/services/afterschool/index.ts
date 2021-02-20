import Joi from 'joi';
import * as controllers from './controllers';
import { AfterschoolTimeValues, DayValues } from '../../types';
import { createService } from '../index';

export default createService({
  name: '방과후 수업 서비스',
  baseURL: '/afterschool',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllAfterschools,
    },
    {
      method: 'get',
      path: '/:afterschoolId',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAfterschool,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        description: Joi.string().required(),
        targetGrades: Joi.array().items(Joi.number()).required(),
        targetClasses: Joi.array().items(Joi.number()).required(),
        key: Joi.string(),
        teacher: Joi.string().required(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).required(),
        times: Joi.array().items(Joi.string().valid(...AfterschoolTimeValues)).required(),
        capacity: Joi.number().required(),
      },
      handler: controllers.createAfterschool,
    },
    {
      method: 'delete',
      path: '/:afterschoolId',
      needAuth: true,
      needPermission: true,
      handler: controllers.deleteAfterschool,
    },
  ],
});
