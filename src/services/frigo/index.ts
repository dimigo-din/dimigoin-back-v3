import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
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
    // {
    //   method: 'post',
    //   path: '/accept',
    //   needAuth: true,
    //   needPermission: true,
    //   validateSchema: {
    //     userId: Joi.number(),
    //   },
    //   handler: controllers.acceptFrigo,
    // },
    // {
    //   method: 'post',
    //   path: '/cancel',
    //   needAuth: true,
    //   needPermission: true,
    //   validateSchema: {
    //     userId: Joi.number(),
    //   },
    //   handler: controllers.cancelFrigo,
    // },
    {
      method: 'post',
      path: '/manage',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        userId: Joi.number(),
        edit: Joi.boolean(),
      },
      handler: controllers.manageFrigo,
    },
  ],
});
