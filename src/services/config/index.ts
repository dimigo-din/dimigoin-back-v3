import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '전역 설정 서비스',
  baseURL: '/config',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: false,
      needPermission: false,
      handler: controllers.getAllConfig,
    },
    {
      method: 'put',
      path: '/',
      needAuth: false,
      needPermission: true,
      validateSchema: {
        key: Joi.string().required(),
        value: Joi.any().required(),
      },
      handler: controllers.editConfig,
    },
  ],
});
