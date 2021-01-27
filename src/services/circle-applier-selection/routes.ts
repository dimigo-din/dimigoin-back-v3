import * as controllers from './controllers';

export default {
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
