import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '인증 서비스',
  baseURL: '/auth',
  routes: [
    {
      method: 'post',
      path: '/',
      validateSchema: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
      handler: controllers.identifyUser,
    },
    {
      method: 'post',
      path: '/refresh',
      handler: controllers.refreshAccessToken,
    },
  ],
};