import Joi from 'joi';
import * as controllers from './controllers';
import {
  AfterschoolTimeValues, NightTimeValues, ClassValues, DayValues, GradeValues,
} from '../../types';
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
        targetGrades: Joi.array().items(Joi.number().valid(...GradeValues)).min(1).max(3)
          .required(),
        targetClasses: Joi.array().items(Joi.number().valid(...ClassValues)).min(1).max(6)
          .required(),
        key: Joi.string().optional(),
        teacher: Joi.string().required(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).required(),
        times: Joi.array().items(Joi.string().valid(...AfterschoolTimeValues, ...NightTimeValues)).required(),
        capacity: Joi.number().required(),
        place: Joi.string().required(),
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
    {
      method: 'patch',
      path: '/:afterschoolId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        targetGrades: Joi.array().items(Joi.number().valid(...GradeValues)).min(1).max(3)
          .optional(),
        targetClasses: Joi.array().items(Joi.number().valid(...ClassValues)).min(1).max(6)
          .optional(),
        key: Joi.string().optional(),
        teacher: Joi.string().optional(),
        days: Joi.array().items(Joi.string().valid(...DayValues)).optional(),
        times: Joi.array().items(Joi.string().valid(...AfterschoolTimeValues, ...NightTimeValues)).optional(),
        capacity: Joi.number().optional(),
        place: Joi.string().optional(),
      },
      handler: controllers.editAfterschool,
    },
  ],
});
