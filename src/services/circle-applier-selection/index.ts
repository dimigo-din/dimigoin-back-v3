import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '동아리 지원자 선발 서비스 (동아리장용)',
  baseURL: '/circle-applier-selection',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.getApplications,
    },
    {
      method: 'patch',
      path: '/:applierId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.setApplierStatus,
    },
  ],
});
