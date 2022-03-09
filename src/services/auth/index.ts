import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '인증 서비스',
  baseURL: '/auth',
  routes: [
    {
      method: 'post',
      path: '/',
      needAuth: false,
      needPermission: false,
      validateSchema: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
      handler: controllers.identifyUser,
    },
    {
      method: 'post',
      needAuth: false,
      needPermission: true,
      path: '/refresh',
      handler: controllers.refreshAccessToken,
    },
    {
      method: 'post',
      needAuth: false,
      needPermission: false,
      path: '/setPwd',
      validateSchema: {
        id: Joi.string().required(),
        code: Joi.string().required(),
        password: Joi.string().required(),
      },
      handler: controllers.setTemporaryPassword,
    },
    {
      method: 'get',
      needAuth: false,
      needPermission: true,
      path: '/getCodes',
      handler: controllers.getCodes,
    },
  ],
});
