import * as controllers from './controllers';

export default {
  name: '동아리 지원자 선발 서비스 (동아리장용)',
  baseURL: '/circle-applier-selection',
  routes: [
    {
      method: 'get',
      path: '/',
      allowedUserTypes: ['S'],
      handler: controllers.getApplications,
    },
    {
      method: 'patch',
      path: '/:applierId',
      allowedUserTypes: ['S'],
      handler: controllers.setApplierStatus,
    },
  ],
};
