import Joi from 'joi';
import * as controllers from './controllers';
import { OutgoRequestStatus } from '../../types';

export default {
  baseURL: '/outgo-management',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['T'],
      handler: controllers.getAllOutgoRequests,
    },
    {
      method: 'get',
      path: '/:outgoRequestId',
      allowedUserTypes: ['T'],
      handler: controllers.getOutgoRequest,
    },
    {
      method: 'patch',
      path: '/:outgoRequestId/toggle',
      allowedUserTypes: ['T'],
      validateSchema: {
        status: Joi.string().valid(...Object.values(OutgoRequestStatus)).required(),
      },
      handler: controllers.toggleOutgoRequestStatus,
    },
  ],
};
