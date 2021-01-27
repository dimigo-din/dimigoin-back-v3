import Joi from 'joi';
import * as controllers from './controllers';

export default {
  baseURL: '/config',
  routes: [
    {
      method: 'get',
      path: '/',
      handler: controllers.getAllConfig,
    },
    {
      method: 'put',
      path: '/',
      allowedUserTypes: ['T'],
      validateSchema: {
        key: Joi.string().required(),
        value: Joi.string().required(),
      },
      handler: controllers.editConfig,
    },
  ],
};
