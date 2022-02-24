import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '달그락 관리 서비스 (디넌장용)',
  baseURL: '/dalgeurak-management',
  routes: [
    {
      method: 'post',
      path: '/permission',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        serial: Joi.number().required(),
        name: Joi.string().required(),
      },
      handler: controllers.addPermission,
    },
    {
      method: 'delete',
      path: '/permission',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        serial: Joi.number().required(),
        name: Joi.string().required(),
      },
      handler: controllers.removePermission,
    },
    {
      method: 'post',
      path: '/mandate',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        serial: Joi.number().required(),
        name: Joi.string().required(),
      },
      handler: controllers.mandate,
    },
  ],
});
