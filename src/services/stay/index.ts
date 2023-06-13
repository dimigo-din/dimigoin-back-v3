import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '잔류 신청 관련 서비스',
  baseURL: '/stay',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: false,
      needPermission: false,
      handler: controllers.getAllStays,
    },
    {
      method: 'get',
      path: '/current',
      needAuth: false,
      needPermission: false,
      handler: controllers.getCurrentStay,
    },
    {
      method: 'get',
      path: '/:stayId',
      needAuth: false,
      needPermission: false,
      handler: controllers.getStay,
    },
    {
      method: 'post',
      path: '/create',
      needAuth: false,
      needPermission: false,
      validateSchema: {
        startline: Joi.date().required(),
        deadline: Joi.date().required(),
        disabled: Joi.boolean().required(),
        deleted: Joi.boolean().required(),
        dates: Joi.array().items(Joi.object({
          date: Joi.date().required(),
          outgo: Joi.boolean().required(),
        })).required(),
      },
      handler: controllers.createStay,
    },
    {
      method: 'patch',
      path: '/:stayId/manage',
      needAuth: false,
      needPermission: false,
      validateSchema: {
        status: Joi.boolean().required(),
      },
      handler: controllers.manageStatus,
    },
    {
      method: 'get',
      path: '/apply/me',
      needAuth: false,
      needPermission: false,
      handler: controllers.getMyStay,
    },
    {
      method: 'post',
      path: '/apply',
      needAuth: false,
      needPermission: false,
      validateSchema: {
        seat: Joi.string().required(),
        reason: Joi.string().allow('').required(),
      },
      handler: controllers.applyStay,
    },
    {
      method: 'delete',
      path: '/cancel',
      needAuth: false,
      needPermission: false,
      handler: controllers.cancelStay,
    },
    {
      method: 'delete',
      path: '/:stayId',
      needAuth: false,
      needPermission: false,
      handler: controllers.deleteStay,
    },
  ],
});
