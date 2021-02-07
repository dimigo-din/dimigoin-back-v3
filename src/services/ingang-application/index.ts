import * as controllers from './controllers';

export default {
  name: '인강실 신청 서비스',
  baseURL: '/ingang-application',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S', 'T'],
      handler: controllers.getTodayIngangApplications,
    },
    {
      method: 'get',
      path: '/export/grade/:grade',
      allowedUserTypes: ['S', 'T'], // S -> 테스트
      handler: controllers.exportTodayIngangApplications,
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
