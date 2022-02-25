import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
import { ClassValues, MealTimeValues } from '../../types';

export default createService({
  name: '달그락 서비스',
  baseURL: '/dalgeurak',
  routes: [
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.checkEntrance,
    },
    {
      method: 'post',
      path: '/entrance',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        serial: Joi.number().required(),
        name: Joi.string().required(),
      },
      handler: controllers.entranceProcess,
    },
    {
      method: 'get',
      path: '/me',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
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
      path: '/exception',
      needAuth: true,
      needPermission: true,
      handler: controllers.getMealExceptions,
    },
    {
      method: 'patch',
      path: '/exception/application',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        permission: Joi.boolean().required(),
        serial: Joi.number().required(),
      },
      handler: controllers.permissionMealException,
    },
    {
      method: 'post',
      path: '/exception/:type',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
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
      studentOnly: true,
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
    {
      method: 'patch',
      path: '/sequence/:grade',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        time: Joi.string().valid(...MealTimeValues).required(),
        sequences: Joi.array().length(6).items(Joi.number().valid(...ClassValues)).required(),
      },
      handler: controllers.editGradeMealSequences,
    },
    {
      method: 'patch',
      path: '/time/:grade',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        time: Joi.string().valid(...MealTimeValues).required(),
        classTimes: Joi.array().length(6).items(Joi.number()).required(),
      },
      handler: controllers.editGradeMealTimes,
    },
    {
      method: 'patch',
      path: '/reload',
      needAuth: true,
      needPermission: true,
      handler: controllers.reloadUsersMealStatus,
    },
  ],
});
