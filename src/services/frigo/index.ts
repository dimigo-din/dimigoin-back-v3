import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
import { FrigoStatusValues } from '../../types';
// import { GenderValues, GradeValues } from '../../types';

export default createService({
  name: '금요귀가 관련 서비스',
  baseURL: '/frigo',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: true,
      handler: controllers.getAllFrigo,
    },
    {
      method: 'get',
      path: '/myFrigo',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMyFrigo,
    },
    {
      method: 'post',
      path: '/apply',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        reason: Joi.string().max(50),
      },
      handler: controllers.applyFrigo,
    },
    {
      method: 'patch',
      path: '/:FrigoRequestId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        status: Joi.string().valid(...FrigoStatusValues),
      },
      handler: controllers.manageFrigo,
    },
  ],
});
