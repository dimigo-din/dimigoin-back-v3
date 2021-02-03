import Joi from 'joi';
import * as controllers from './controllers';

export default {
  name: '각종 실 관련 서비스',
  baseURL: '/place',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: '*',
      handler: controllers.getAllPlaces,
    },
    {
      method: 'get',
      path: '/primary',
      allowedUserTypes: ['S'],
      handler: controllers.getPrimaryPlaces,
    },
    {
      method: 'patch',
      path: '/:placeId',
      allowedUserTypes: ['S'],
      validateSchema: {
        name: Joi.string(),
        type: Joi.string(),
        location: Joi.string(),
        description: Joi.string(),
      },
      handler: controllers.editPlace,
    },
    {
      method: 'post',
      path: '/',
      allowedUserTypes: '*',
      validateSchema: {
        name: Joi.string().required(),
        type: Joi.string(),
        location: Joi.string().required(),
        description: Joi.string(),
      },
      handler: controllers.createPlace,
    },
    {
      method: 'get',
      path: '/:placeId',
      allowedUserTypes: '*',
      handler: controllers.getPlace,
    },
    {
      method: 'delete',
      path: '/:placeId',
      allowedUserTypes: ['T'],
      handler: controllers.deletePlace,
    },
  ],
};
