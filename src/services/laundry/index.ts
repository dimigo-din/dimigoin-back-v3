import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';
import { GenderValues } from '../../types';

export default createService({
  name: '세탁 관련 서비스',
  baseURL: '/laundry',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllWashers,
    },
    {
      method: 'get',
      path: '/available',
      needAuth: true,
      needPermission: false,
      validateSchema: {
        gender: Joi.string().valid(...GenderValues),
      },
      handler: controllers.getAvailableWashers,
    },
  ],
});
