import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
import { StayOutgoStatusValues } from '../../types';

export default createService({
  name: '잔류 외출 관련 서비스',
  baseURL: '/stay-outgo',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: false,
      needPermission: false,
      handler: controllers.getAllStayOutgo,
    },
    {
      method: 'get',
      path: '/current',
      needAuth: false,
      needPermission: false,
      handler: controllers.getCurrentStayOutgo,
    },
    {
      method: 'get',
      path: '/my',
      needAuth: false,
      needPermission: false,
      handler: controllers.getMyStayOutgo,
    },
    {
      method: 'post',
      path: '/apply',
      needAuth: false,
      needPermission: false,
      validateSchema: {
        // date: Joi.date().required(),
        duration: Joi.object({
          start: Joi.date().required(),
          end: Joi.date().required(),
        }),
        breakfast: Joi.boolean().required(),
        lunch: Joi.boolean().required(),
        dinner: Joi.boolean().required(),
        reason: Joi.string().required(),
      },
      handler: controllers.applyStayOutgo,
    },
    {
      method: 'get',
      path: '/:stayOutgoId',
      needAuth: false,
      needPermission: false,
      handler: controllers.getStayOutgoById,
    },
    {
      method: 'patch',
      path: '/:stayOutgoId',
      needAuth: false,
      needPermission: false,
      validateSchema: {
        status: Joi.string().valid(...StayOutgoStatusValues),
      },
      handler: controllers.manageStayOutgo,
    },
  ],
});
