import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '동아리 지원 관리 서비스 (교사용)',
  baseURL: '/circle-application-management',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['T'],
      handler: controllers.getAllApplications,
    },
    {
      method: 'put',
      path: '/form',
      allowedUserTypes: ['T'],
      validateSchema: {
        form: Joi.object().required(),
      },
      handler: controllers.updateApplicationForm,
    },
  ],
};
