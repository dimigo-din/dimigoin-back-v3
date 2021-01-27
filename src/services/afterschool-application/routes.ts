import * as controllers from './controllers';

export default {
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
