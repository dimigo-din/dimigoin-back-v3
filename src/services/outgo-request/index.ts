import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '외출 신청 서비스',
  baseURL: '/outgo-request',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getMyOutgoRequests,
    },
    {
      method: 'get',
      path: '/:outgoRequestId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getOutgoRequest,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        applier: Joi.array().items(Joi.string()).min(1).required(),
        approver: Joi.string().required(),
        reason: Joi.string().required(),
        detailReason: Joi.string().default(''),
        duration: Joi.object({
          start: Joi.date().required(),
          end: Joi.date().required(),
        }).required(),
      },
      handler: controllers.createOutgoRequest,
    },
  ],
});
