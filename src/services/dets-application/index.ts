import * as controllers from './controllers';

export default {
  name: 'DETS 수강 신청 서비스',
  baseURL: '/dets-application',
  routes: [
    {
      method: 'post',
      path: '/:detsId',
      allowedUserTypes: ['S'],
      handler: controllers.applyAfterschool,
    },
    {
      method: 'delete',
      path: '/:detsId',
      allowedUserTypes: ['S'],
      handler: controllers.cancelApplication,
    },
  ],
};
