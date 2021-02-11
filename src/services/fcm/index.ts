import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: 'Firebase Cloud Messaging',
  baseURL: '/fcm',
  routes: [
    {
      method: 'post',
      path: '/token',
      handler: controllers.registerDeviceToken,
      validateSchema: {
        deviceToken: Joi.string().required(),
      },
    },
    {
      method: 'delete',
      path: '/token',
      handler: controllers.revokeDeviceToken,
      validateSchema: {
        deviceToken: Joi.string().required(),
      },
    },
    {
      method: 'get',
      path: '/token',
      handler: controllers.getAllDeviceTokens,
    },
    // 아직은 쓸 일이 없을 것 같음
    {
      method: 'post',
      path: '/send',
      handler: controllers.sendPushMessage,
    },
  ],
};