import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '동아리 관련 서비스',
  baseURL: '/circle',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllCircles,
    },
    {
      method: 'get',
      path: '/my-circle',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMyCircle,
    },
    {
      method: 'get',
      path: '/:circleId',

      needAuth: true,
      needPermission: false,
      handler: controllers.getCircle,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        fullName: Joi.string(),
        imageUrl: Joi.string().required(),
        description: Joi.string(),
        chair: Joi.string().required(),
        viceChair: Joi.string().required(),
        category: Joi.string().required(),
      },
      handler: controllers.createCircle,
    },
    {
      method: 'delete',
      path: '/:circleId',
      needAuth: true,
      needPermission: true,
      handler: controllers.removeCircle,
    },
    {
      method: 'patch',
      path: '/:circleId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        fullName: Joi.string(),
        imageUrl: Joi.string().required(),
        description: Joi.string().required(),
        chair: Joi.string().required(),
        viceChair: Joi.string().required(),
        category: Joi.string().required(),
      },
      handler: controllers.editCircle,
    },
  ],
});
