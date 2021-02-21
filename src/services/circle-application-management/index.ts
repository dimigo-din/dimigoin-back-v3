import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '동아리 지원 관리 서비스 (관리자용)',
  baseURL: '/circle-application-management',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: true,
      handler: controllers.getAllApplications,
    },
    {
      method: 'put',
      path: '/form',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        form: Joi.array().items(Joi.object({
          question: Joi.string().required(),
          maxLength: Joi.number().required(),
        })).min(1).required(),
      },
      handler: controllers.updateApplicationForm,
    },
  ],
});
