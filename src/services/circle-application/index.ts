import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '동아리 지원 서비스',
  baseURL: '/circle-application',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getApplicationStatus,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      validateSchema: {
        circle: Joi.string().required(),
        form: Joi.object().required(),
      },
      handler: controllers.createApplication,
    },
    {
      method: 'get',
      path: '/form',
      needAuth: true,
      needPermission: false,
      handler: controllers.getApplicationForm,
    },
    {
      method: 'patch',
      path: '/:applicationId/final',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.finalSelection,
    },
  ],
});
