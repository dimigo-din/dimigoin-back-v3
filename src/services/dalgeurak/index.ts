import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
import { ClassValues } from '../../types';

export default createService({
  name: '달그락 서비스',
  baseURL: '/dalgeurak',
  routes: [
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.checkEntrance,
    },
    {
      method: 'get',
      path: '/me',
      needAuth: true,
      needPermission: false,
      handler: controllers.getUserInfo,
    },
    {
      method: 'post',
      path: '/extra',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        extraMinute: Joi.number().required(),
      },
      handler: controllers.editExtraTime,
    },
    {
      method: 'get',
      path: '/exception/:type',
      needAuth: true,
      needPermission: true,
      handler: controllers.getMealExceptions,
    },
    {
      method: 'post',
      path: '/exception/:type',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        reason: Joi.string().required(),
      },
      handler: controllers.createMealExceptions,
    },
    {
      method: 'delete',
      path: '/exception',
      needAuth: true,
      needPermission: false,
      handler: controllers.cancelMealException,
    },
    {
      method: 'get',
      path: '/sequence',
      needAuth: false,
      needPermission: false,
      handler: controllers.getMealSequences,
    },
    {
      method: 'get',
      path: '/time',
      needAuth: false,
      needPermission: false,
      handler: controllers.getMealTimes,
    },
    {
      method: 'patch',
      path: '/sequence',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        lunch: Joi.array().length(3).items(Joi.array().length(6).items(Joi.number().valid(...ClassValues))).required(),
        dinner: Joi.array().length(3).items(Joi.array().length(6).items(Joi.number().valid(...ClassValues))).required(),
      },
      handler: controllers.editMealSequences,
    },
    {
      method: 'patch',
      path: '/time',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        lunch: Joi.array().length(3).items(Joi.array().length(6).items(Joi.number())).required(),
        dinner: Joi.array().length(3).items(Joi.array().length(6).items(Joi.number())).required(),
      },
      handler: controllers.editMealTimes,
    },
  ],
});
