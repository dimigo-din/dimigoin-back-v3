import * as controllers from './controllers';
import { createService } from '../index';

export default createService({
  name: '방과후 수강 신청 서비스',
  baseURL: '/afterschool-application',
  routes: [
    {
      method: 'get',
      path: '/',
      needAuth: true,
      needPermission: false,
      handler: controllers.getMyAllApplications,
    },
    {
      method: 'post',
      path: '/:afterschoolId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.applyAfterschool,
    },
    {
      method: 'delete',
      path: '/:afterschoolId',
      needAuth: true,
      needPermission: false,
      studentOnly: true,
      handler: controllers.cancelApplication,
    },
    {
      method: 'post',
      path: '/export/grade/:grade',
      needAuth: true,
      needPermission: true,
      handler: controllers.exportAfterschoolApplications,
    },
  ],
});
