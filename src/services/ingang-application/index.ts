import * as controllers from './controllers';

export default {
  name: '인강실 신청 서비스',
  baseURL: '/ingang-application',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getAllIngangApplications,
    },
    {
      method: 'get',
      path: '/status',
      allowedUserTypes: ['S'],
      handler: controllers.getIngangStatus,
    },
    {
      method: 'post',
      path: '/time/:time',
      allowedUserTypes: ['S'],
      handler: controllers.createIngangApplication,
    },
    {
      method: 'delete',
      path: '/time/:time',
      allowedUserTypes: ['S'],
      handler: controllers.removeIngangApplication,
    },
  ],
};
