import Joi from 'joi';
import * as controllers from './controllers';
import { OutgoRequestStatus } from '../../types';
import { createService } from '../index';

export default createService({
  name: '외출 신청 관리 서비스',
  baseURL: '/outgo-management',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllOutgoRequests,
    },
    {
      method: 'get',
      path: '/:outgoRequestId',
      needAuth: true,
      needPermission: true,
      handler: controllers.getOutgoRequest,
    },
    {
      method: 'patch',
      path: '/:outgoRequestId/toggle',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        status: Joi.string().valid(...Object.values(OutgoRequestStatus)).required(),
      },
      handler: controllers.toggleOutgoRequestStatus,
    },
  ],
});
