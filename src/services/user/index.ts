import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '사용자 조회 서비스',
  baseURL: '/user',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllUsers,
    },
    {
      method: 'get',
      path: '/student',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllStds,
    },
    {
      method: 'get',
      path: '/teacher',
      needAuth: true,
      needPermission: false,
      handler: controllers.getAllTchs,
    },
    {
      method: 'get',
      path: '/me',
      needAuth: true,
      needPermission: false,
      handler: controllers.decodeJWT,
    },
  ],
});
