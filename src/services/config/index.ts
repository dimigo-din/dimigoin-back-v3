import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '전역 설정 서비스',
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
        value: Joi.any().required(),
      },
      handler: controllers.editConfig,
    },
  ],
};
