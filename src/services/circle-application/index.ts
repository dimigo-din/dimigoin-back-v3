import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '동아리 지원 서비스',
  baseURL: '/circle-application',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S'],
      handler: controllers.getApplicationStatus,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['S'],
      validateSchema: {
        circle: Joi.string().required(),
        form: Joi.object().required(),
      },
      handler: controllers.createApplication,
    },
    {
      method: 'get',
      path: '/form',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getApplicationForm,
    },
    {
      method: 'patch',
      path: '/final/:circleId',
      allowedUserTypes: ['S'],
      handler: controllers.finalSelection,
    },
  ],
};
