import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
import { GenderValues, GradeValues, WasherValues } from '../../types';

export default createService({
  name: '세탁 관련 서비스',
  baseURL: '/laundry',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllWashers,
    },
    {
      method: 'post',
      path: '/create',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().valid(...WasherValues),
        grade: Joi.string().valid(...GradeValues),
        gender: Joi.string().valid(...GenderValues),
      },
      handler: controllers.createWasher,
    },
    {
      method: 'get',
      path: '/available',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        gender: Joi.string().valid(...GenderValues),
      },
      handler: controllers.getAvailableWashers,
    },
    {
      method: 'post',
      path: '/apply',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        applyTime: Joi.number(),
        washerName: Joi.string().valid(...WasherValues),
      },
      handler: controllers.applyLaundry,
    },
    {
      method: 'patch',
      path: '/edit',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        washerName: Joi.string().valid(...WasherValues),
        grade: Joi.array().items(Joi.number().valid(...GradeValues)),
      },
      handler: controllers.editGrade,
    },
  ],
});
