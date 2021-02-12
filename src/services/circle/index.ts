import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '동아리 관련 서비스',
  baseURL: '/circle',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getAllCircles,
    },
    {
      method: 'get',
      path: '/:circleId',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getOneCircle,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      validateSchema: {
        name: Joi.string().required(),
        description: Joi.string().required(),
        chair: Joi.string().required(),
        viceChair: Joi.string().required(),
        videoLink: Joi.string().required(),
        category: Joi.string().required(),
      },
      handler: controllers.createCircle,
    },
    {
      method: 'delete',
      path: '/:circleId',
      allowedUserTypes: ['T'],
      handler: controllers.removeCircle,
    },
  ],
};
