import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '각종 실 관련 서비스',
  baseURL: '/place',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllPlaces,
    },
    {
      method: 'get',
      path: '/primary',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getPrimaryPlaces,
    },
    {
      method: 'patch',
      path: '/:placeId',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        type: Joi.string().required(),
        location: Joi.string().required(),
        building: Joi.string().required(),
        floor: Joi.number().required(),
        nick: Joi.string().required(),
      },
      handler: controllers.editPlace,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: true,
      validateSchema: {
        name: Joi.string().required(),
        type: Joi.string().required(),
        location: Joi.string().required(),
        building: Joi.string().required(),
        floor: Joi.number().required(),
        nick: Joi.string().required(),
      },
      handler: controllers.createPlace,
    },
    {
      method: 'get',
      path: '/:placeId',
      needAuth: true,
      needPermission: false,
      handler: controllers.getPlace,
    },
    {
      method: 'delete',
      path: '/:placeId',
      needAuth: true,
      needPermission: true,
      handler: controllers.deletePlace,
    },
  ],
});
