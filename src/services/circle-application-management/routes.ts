import Joi from 'joi';
import * as controllers from './controllers';

export default {
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
