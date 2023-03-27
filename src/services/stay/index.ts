import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '잔류 신청 관련 서비스',
  baseURL: '/stay',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllStays,
    },
    {
      method: 'post',
      path: '/',
      needAuth: true,
      needPermission: true,
      validateSchema: {

      },
      handler: controllers.createStay,
    },
  ],
});
