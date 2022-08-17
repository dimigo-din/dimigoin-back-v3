import Joi from 'joi';
import { createService } from '../index';
import {
  ClassValues,
  MealTimeValues,
  MealExceptionApplicationStatusValues,
  MealExceptionValues,
} from '../../types';
import { checkApplicationTime } from '../../middlewares/check-application-time';

import * as controllers from './controllers';
import * as extraControllers from './extra.controller';
import * as exceptionControllers from './exception.controller';
import * as timeControllers from './time.controller';
import * as fcmControllers from './fcm.controller';
import * as dinnenControllers from './dinnen.controller';
import * as convenienceControllers from './convenience.controller';
import warningController from './warning.controller';

export default createService({
  name: '달그락 서비스',
  baseURL: '/dalgeurak',
  routes: [
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        key: Joi.string().required(),
      },
      handler: controllers.checkEntrance,
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
      handler: extraControllers.editExtraTime,
    },
    {
      method: 'get',
      path: '/extraTime',
      needAuth: false,
      needPermission: false,
      handler: extraControllers.getMealExtraTimes,
    },
    {
      method: 'get',
      path: '/exception',
      needAuth: true,
      needPermission: true,
      handler: exceptionControllers.getMealExceptions,
    },
    {
      method: 'post',
      path: '/exception/give',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        type: Joi.string().valid(...MealExceptionValues).required(),
        sid: Joi.string().required(),
        reason: Joi.string().required(),
      },
      teacherOnly: true,
      handler: exceptionControllers.giveMealException,
    },
    {
      method: 'post',
      path: '/exception/ticket',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        time: Joi.string().valid(...MealTimeValues).required(),
      },
      middlewares: [checkApplicationTime],
      handler: exceptionControllers.useFirstMealTicket,
    },
    {
      method: 'post',
      path: '/exception/:type',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        reason: Joi.string().required(),
        time: Joi.string().valid(...MealTimeValues).required(),
        date: Joi.string().required(),
      },
      handler: exceptionControllers.createMealExceptions,
    },
    {
      method: 'patch',
      path: '/exception/application',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        permission: Joi.string().valid(...MealExceptionApplicationStatusValues).required(),
        sid: Joi.string().required(),
      },
      teacherOnly: true,
      handler: exceptionControllers.permissionMealException,
    },
    {
      method: 'delete',
      path: '/exception',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: exceptionControllers.cancelMealException,
    },
    {
      method: 'get',
      path: '/nowSequence',
      needAuth: true,
      needPermission: false,
      handler: timeControllers.getNowSequence,
    },
    {
      method: 'get',
      path: '/sequence',
      needAuth: false,
      needPermission: false,
      handler: timeControllers.getMealSequences,
    },
    {
      method: 'get',
      path: '/time',
      needAuth: false,
      needPermission: false,
      handler: timeControllers.getMealTimes,
    },
    {
      method: 'patch',
      path: '/sequence',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        lunch: Joi.array().length(2).items(Joi.array().length(6).items(Joi.number().valid(...ClassValues))).required(),
        dinner: Joi.array().length(2).items(Joi.array().length(6).items(Joi.number().valid(...ClassValues))).required(),
      },
      handler: timeControllers.editMealSequences,
    },
    {
      method: 'patch',
      path: '/time',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        lunch: Joi.array().length(2).items(Joi.array().length(6).items(Joi.number())).required(),
        dinner: Joi.array().length(2).items(Joi.array().length(6).items(Joi.number())).required(),
      },
      handler: timeControllers.editMealTimes,
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
      handler: timeControllers.editGradeMealSequences,
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
      handler: timeControllers.editGradeMealTimes,
    },
    {
      method: 'get',
      path: '/checkinlog/:targetGrade/:targetClass/:targetNumber',
      needAuth: true,
      needPermission: false,
      handler: controllers.getCheckInLog,
    },
    {
      method: 'post',
      path: '/warning',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        sid: Joi.string().required(),
        type: Joi.array().required(),
        reason: Joi.string().required(),
      },
      handler: warningController,
    },
    {
      method: 'get',
      path: '/token',
      needAuth: true,
      needPermission: false,
      handler: fcmControllers.getDeviceTokens,
    },
    {
      method: 'post',
      path: '/token',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        deviceToken: Joi.string().required(),
      },
      handler: fcmControllers.registerDeviceToken,
    },
    {
      method: 'delete',
      path: '/token',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        deviceToken: Joi.string().required(),
      },
      handler: fcmControllers.revokeDeviceToken,
    },
    {
      method: 'get',
      path: '/convenience/set',
      needAuth: true,
      needPermission: true,
      handler: convenienceControllers.createConvenience,
    },
    {
      method: 'get',
      path: '/convenience',
      needAuth: true,
      needPermission: false,
      handler: convenienceControllers.getConvenience,
    },
    {
      method: 'post',
      path: '/convenience',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        time: Joi.string().required(),
        food: Joi.string().required(),
      },
      handler: convenienceControllers.convenienceAppli,
    },
    {
      method: 'post',
      path: '/convenience/checkin',
      needAuth: true,
      needPermission: false,
      handler: convenienceControllers.checkIn,
    },
    // 디넌용
    {
      method: 'post',
      path: '/entrance',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        sid: Joi.string().required(),
      },
      handler: dinnenControllers.entranceProcess,
    },
    {
      method: 'get',
      path: '/mealstatus',
      needAuth: true,
      needPermission: true,
      handler: dinnenControllers.getMealStatuses,
    },
    {
      method: 'put',
      path: '/waitingLine',
      needAuth: true,
      needPermission: true,
      handler: dinnenControllers.updateWaitingLine,
    },
    {
      method: 'get',
      path: '/student',
      needAuth: true,
      needPermission: true,
      handler: dinnenControllers.getAllStudents,
    },
    {
      method: 'post',
      path: '/alert',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        title: Joi.string().required(),
        message: Joi.string().required(),
      },
      handler: dinnenControllers.alertTest,
    },
  ],
});
