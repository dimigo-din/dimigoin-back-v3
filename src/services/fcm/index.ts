import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: 'Firebase Cloud Messaging',
  baseURL: '/fcm',
  routes: [
    {
      method: 'post',
      path: '/token',
      needAuth: true,
      needPermission: false,
      handler: controllers.registerDeviceToken,
      validateSchema: {
        deviceToken: Joi.string().required(),
      },
    },
    {
      method: 'delete',
      path: '/token',
      needAuth: true,
      needPermission: false,
      handler: controllers.revokeDeviceToken,
      validateSchema: {
        deviceToken: Joi.string().required(),
      },
    },
    {
      method: 'get',
      path: '/token',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllDeviceTokens,
    },
    // 아직은 쓸 일이 없을 것 같음
    {
      method: 'post',
      path: '/send',
      needAuth: true,
      needPermission: true,
      handler: controllers.sendPushMessage,
    },
  ],
});
