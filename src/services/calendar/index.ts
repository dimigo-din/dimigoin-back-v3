// import Joi from 'joi';
import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '학사일정 관리 서비스',
  baseURL: '/calendar',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getCalendar,
    },
  ],
});
