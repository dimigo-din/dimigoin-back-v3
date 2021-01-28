import * as controllers from './controllers';

export default {
  name: '방과후 수강 신청 서비스',
  baseURL: '/afterschool-application',
  routes: [
    {
      method: 'post',
      path: '/:afterschoolId',
      allowedUserTypes: ['S'],
      handler: controllers.applyAfterschool,
    },
    {
      method: 'delete',
      path: '/:afterschoolId',
      allowedUserTypes: ['S'],
      handler: controllers.cancelApplication,
    },
  ],
};
