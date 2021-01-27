import Joi from 'joi';
import * as controllers from './controllers';

export default {
  baseURL: '/outgo-request',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S'],
      handler: controllers.getMyOutgoRequests,
    },
    {
      method: 'get',
      path: '/:outgoRequestId',
      allowedUserTypes: ['S'],
      handler: controllers.getOutgoRequest,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['S'],
      validateSchema: {
        applier: Joi.array().items(Joi.string()).required(),
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
};
