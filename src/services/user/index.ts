import * as controllers from './controllers';

export default {
  name: '사용자 조회 서비스',
  baseURL: '/user',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: '*',
      handler: controllers.getAllUsers,
    },
    {
      method: 'get',
      path: '/student',
      allowedUserTypes: '*',
      handler: controllers.getAllStudents,
    },
    {
      method: 'get',
      path: '/teacher',
      allowedUserTypes: '*',
      handler: controllers.getAllTeachers,
    },
    {
      method: 'get',
      path: '/me',
      allowedUserTypes: '*',
      handler: controllers.decodeJWT,
    },
    {
      method: 'get',
      path: '/reload',
      handler: controllers.reloadUsers,
    },
  ],
};
